import { Renderer } from "@k8slens/extensions";
import React from "react";
import fs from "fs";
import { SettingsEditor } from "./SettingsEditor";
import { Helper } from "./Helper";
import AppViewerPage from "./src/AppViewerPage";
import { AiTwotoneAppstore } from "react-icons/ai";

console.warn('Bootstrap CSS Injected!!!');
Helper.registerStylesheetFromNodeModule("bootstrap", 
//"bootstrap/dist/css/bootstrap.min.css",
"bootstrap-dark-5/dist/css/bootstrap-dark.css"
);


const RegisterServiceButton = (
  props: Renderer.Component.KubeObjectDetailsProps<Renderer.K8sApi.Service>
) => (
  <div
    style={{
      marginTop: 10,
      backgroundColor: "var(--layoutBackground)",
      borderRadius: 6,
      padding: 10,
      boxShadow:'0px 5px 10px var(--boxShadow)',
      color: 'var(--textColorSecondary) !important',
      border: '1px solid rgba(0,0,0,0.1)'
    }}
  >
    <div>
      <div style={{ marginBottom: 15 }}>
        <h5
          style={{
            display: "inline-block",
            fontWeight: "bold",
            padding: 10,
            color: 'var(--textColorSecondary) !important'
          }}
        >
          App Viewer
        </h5>
      </div>
      <span
        style={{
          fontStyle: "italic",
          padding: 10,
          marginBottom: 5,
        }}
      >
        You can add these ports to App viewer
      </span>
    </div>
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-end",
        flexWrap: "wrap",
        marginTop: 10,
      }}
    >
      {props.object.getPorts().map((port: any) => (
        <Renderer.Component.Button
          style={{ margin: 5 }}
          onClick={() => {
            var editor: SettingsEditor = new SettingsEditor();
            var cluster: any = editor.data.getCluster(
              Helper.getCurrentClusterId()
            );
            cluster.name = Helper.getCurrentClusterName();
            cluster.registerService(props.object, port);
            editor.save();
          }}
        >
          {port.port}:{port.targetPort}
        </Renderer.Component.Button>
      ))}
    </div>
  </div>
);

export default class UIExtension extends Renderer.LensExtension {
  constructor(a: any) {
    super(a);
  }
  clusterPages = [
    {
      id: "appviewer",
      components: {
        Page: (props: any) => (
          <AppViewerPage extension={this} pageProps={props} />
        ),
        MenuIcon: AiTwotoneAppstore,
      },
    },
  ];
  clusterPageMenus = [
    {
      target: { pageId: "appviewer" },
      title: "App Viewer",
      components: {
        Icon: () => (
          <AiTwotoneAppstore
            style={{ marginLeft: 2.5 }}
            size={24}
          ></AiTwotoneAppstore>
        ),
      },
    },
  ];
  kubeObjectDetailItems = [
    {
      kind: "Service",
      apiVersions: ["v1"],
      components: {
        Details: RegisterServiceButton,
      },
    },
  ];
}
