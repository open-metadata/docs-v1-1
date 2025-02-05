import React from "react";
import { CodePreviewContextProvider } from "../../context/CodePreviewContext";
import styles from "./CodePreview.module.css";

export default function CodePreview({ children }) {
  return (
    <CodePreviewContextProvider>
      <div className={styles.Container} id="code-preview-container">
        {children}
      </div>
    </CodePreviewContextProvider>
  );
}
