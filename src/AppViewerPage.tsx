import { Common, Main, Renderer } from "@k8slens/extensions";
import cluster from "cluster";
import React, { useState } from "react";
import { Helper } from "../Helper";
import { FcInfo } from "react-icons/fc";
import gis from "g-i-s";
import Loading from "./Loading";
import { GiCubeforce } from "react-icons/gi";
import stringSimilarity from "string-similarity";
import { VscEdit, VscSave } from "react-icons/vsc";
import { AiFillDelete } from "react-icons/ai";

import {
  ClusterServiceSettings,
  ClusterSettings,
  SettingsEditor,
} from "../SettingsEditor";
import { Toast, Button, Alert, Row, Col } from "react-bootstrap";

export default class AppViewerPage extends React.Component {
  props: {
    extension: any;
    pageProps: any;
  };
  settings: SettingsEditor;
  state = {
    canEdit: false,
    loading: true,
  };

  constructor(props: any) {
    super(props);
    this.settings = new SettingsEditor();
    var timer = setInterval(() => {
      var id = Helper.getCurrentClusterId();
      if (id !== null && id !== undefined) {
        clearInterval(timer);
        this.setState({ loading: false });
      }
    }, 200);
  }
  saveChanges() {
    this.setState({ loading: true });
    this.settings.save();
    this.setState({ canEdit: false, loading: false });
  }
  edit() {
    this.setState({ canEdit: true });
  }
  async itemOnDelete(item: ClusterServiceSettings, panel: AppViewerPage) {
    panel.setState({ loading: true });
    const data = panel.settings.data;
    const cluster = panel.settings.data.Clusters.filter(
      (p) => p.Id == Helper.getCurrentClusterId()
    )[0];
    cluster.Services = cluster.Services.filter((p) => p.Id !== item.Id);
    panel.settings.data = data;
    panel.settings.save();

    panel.setState({ loading: false });
  }
  render() {
    var items: ClusterServiceSettings[];
    var cluster: ClusterSettings;

    try {
      cluster = this.settings.data.Clusters.filter(
        (p) => p.Id == Helper.getCurrentClusterId()
      )[0];
      items = cluster.Services || [];
    } catch (err) {
      items = [];
    }
    return (
      <div
        style={{
          height: "100%",
          overflow: "auto",
          backgroundColor: "var(--layoutBackground)",
          padding: 20,
        }}
      >
        <Loading show={this.state.loading} />

        <div>
          <div style={{ display: "flex" }}>
            <h3 style={{ flex: 1 }}>App Viewer</h3>
            <div className="module_bootstrap">
              {this.state.canEdit ? (
                <Button
                  onClick={this.saveChanges.bind(this)}
                  variant="outline-success"
                >
                  <VscSave size={24} /> Save
                </Button>
              ) : (
                <Button
                  onClick={this.edit.bind(this)}
                  variant="outline-secondary"
                >
                  <VscEdit size={24} /> Edit
                </Button>
              )}
            </div>
          </div>
          <div className="module_bootstrap">
            <hr></hr>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {items.map((item, i) => {
              return (
                <AppItem
                  onDelete={this.itemOnDelete}
                  canEdit={this.state.canEdit}
                  cluster={cluster}
                  item={item}
                  key={i}
                  panel={this}
                ></AppItem>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

class Styles {
  public static AppItem: React.CSSProperties = {
    padding: 10,
    backgroundColor: "var(--sidebarBackground)",
    borderRadius: 12,
    margin: 10,
    boxShadow: "0px 4px 20px var(--boxShadow)",
    color: "var(--textColorPrimary)",
    border: "1px solid rgba(0,0,0,0.1)",
    maxWidth: 250,
    minWidth: 250,
    width: 250,
    minHeight: 250,
    maxHeight: 250,
    height: 250,
    display: "flex",
  };
}
class AppItem extends React.Component {
  props: {
    item: ClusterServiceSettings;
    cluster: ClusterSettings;
    canEdit: Boolean;
    onDelete: (item: ClusterServiceSettings, panel: AppViewerPage) => void;
    panel: AppViewerPage;
  };
  state = {
    loading: false,
    icon: null as string,
  };
  async portForward() {
    this.setState({ loading: true });
    const item = this.props.item;
    const cluster = this.props.cluster;
    const apiPath = `/api/pods/${item.Namespace}/service/${item.ServiceName}/port-forward/${item.Port.port}`;
    const apiUrl = `http://localhost:${location.port}`;
    try {
      var result = await fetch(apiUrl + apiPath, {
        method: "post",
        headers: {
          Host: `${cluster.Id}.localhost:${location.port}`,
          "Content-Type": "application/json",
        },
      })
        .then((p) => p.json())
        .catch(console.error);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => {
        this.setState({ loading: false });
      }, 1000);
    }
  }

  async openApp() {
    this.portForward.call(this);
  }
  async loadLogo() {
    var search = "";
    this.setState({ loading: true });
    const formatName = (v: string) => {
      var parts = v
        .split(/[-\s]+/g)
        .filter((p) => {
          if (!isNaN(parseFloat(p))) {
            return false;
          }
          return true;
        })
        .join(" ")
        .split(" ");
      return parts.join(" ");
    };
    var searchTerm: string = formatName(this.props.item.Name);
    if (
      this.props.item.Labels &&
      this.props.item.Labels.hasOwnProperty("app.kubernetes.io/name")
    ) {
      searchTerm = formatName(this.props.item.Labels["app.kubernetes.io/name"]);
    }
    search = searchTerm + " logo";
    var id =
      this.props.cluster.Id +
      "_" +
      this.props.item.ServiceName +
      "_" +
      this.props.item.Namespace;

    if (await Helper.haveLogo(id)) {
      this.setState({
        icon: await Helper.cacheLogo(id, null)
          .then((p) => p.logo)
          .catch(console.error),
      });
      setTimeout(() => {
        this.setState({ loading: false });
      }, 1000);
    } else {
      gis(search, async (err, res) => {
        var matched = res
          .filter((p) => p.url.endsWith(".svg"))
          .map((p) => p.url)[0];
        if (!matched) {
          matched = res
            .filter((p) => p.url.endsWith(".png"))
            .map((p) => p.url)[0];
        }
        console.log("MATCHED", matched);
        if (matched) {
          this.setState({
            icon: await Helper.cacheLogo(id, matched)
              .then((p) => p.logo)
              .catch(console.error),
          });
        }
        setTimeout(() => {
          this.setState({ loading: false });
        }, 1000);
      });
    }
  }
  componentDidMount() {
    this.loadLogo.call(this);
  }
  render() {
    const item = this.props.item;
    const canEdit = this.props.canEdit;
    return (
      <div className="module_loading">
        <div style={Styles.AppItem}>
          <Loading show={this.state.loading} />

          <div
            onClick={!canEdit && this.openApp.bind(this)}
            style={{
              display: "flex",
              flexDirection: "column",
              cursor: "pointer",
              userSelect: "none",
              flex: 1,
            }}
          >
            {canEdit && (
              <div style={{ padding: 10, textAlign:'right' }} className="module_bootstrap">
                <Button
                  onClick={this.props.onDelete.bind(
                    this,
                    item,
                    this.props.panel
                  )}
                  variant="danger"
                  style={{ textAlign: "center" }}
                >
                  <AiFillDelete size={24} /> Delete
                </Button>
              </div>
            )}
            <div
              style={{
                margin: 10,
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyItems: "center",
                textAlign: "center",
              }}
            >
              {this.state.icon ? (
                <img
                  onError={(evt) => {
                    this.setState({ icon: null });
                  }}
                  style={{ maxHeight: 80, margin: "auto" }}
                  src={this.state.icon}
                ></img>
              ) : (
                <GiCubeforce style={{ margin: "auto" }} size={80}></GiCubeforce>
              )}
            </div>
            <div
              style={{
                padding: 10,
                minHeight: 50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {canEdit ? (
                <div className="form-group" style={{ flex: 1 }}>
                  <input
                    style={{
                      width: "100%",
                      borderRadius: 4,
                      padding: 10,
                      textAlign: "center",
                    }}
                    type="text"
                    className="form-control"
                    value={item.Name}
                    autoCorrect="off"
                    autoCapitalize="on"
                    spellCheck="false"
                    onChange={(evt) => {
                      item.Name = evt.target.value;
                      this.forceUpdate();
                    }}
                  />
                </div>
              ) : (
                <h6
                  style={{
                    textAlign: "center",
                    flex: 1,
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                  }}
                >
                  {item.Name}
                </h6>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
