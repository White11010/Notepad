import { ipcRenderer } from "electron";

window.addEventListener("DOMContentLoaded", () => {
  const DOMElementsMap = {
    saveDocumentButton: document.getElementById("save-button"),
    createDocumentButton: document.getElementById("new-button"),
    openDocumentButton: document.getElementById("open-button"),
    closeApplicationButton: document.getElementById("close-button"),
    textareaInput: document.getElementById("textarea-input") as HTMLInputElement,
    documentName: document.getElementById("document-name"),
    documentNameStar: document.getElementById("document-name-star"),
  };

  // DOM elements event listeners
  DOMElementsMap.saveDocumentButton.addEventListener("click", () => {
    ipcRenderer.send("save-document-triggered", {
      inputText: DOMElementsMap.textareaInput.value,
    });
  });

  DOMElementsMap.openDocumentButton.addEventListener("click", () => {
    ipcRenderer.send("open-document-triggered");
  });

  DOMElementsMap.createDocumentButton.addEventListener("click", () => {
    ipcRenderer.send("new-document-triggered");
    DOMElementsMap.textareaInput.value = "";
  });

  DOMElementsMap.closeApplicationButton.addEventListener("click", () => {
    ipcRenderer.send("close-application-triggered");
  });

  DOMElementsMap.textareaInput.addEventListener("input", () => {
    DOMElementsMap.documentNameStar.innerText = "*";
  });

  // Renderer event listeners
  ipcRenderer.on("open-document", (_, args) => {
    DOMElementsMap.textareaInput.value = args.text;
    DOMElementsMap.documentName.innerText = args.title;
  });

  ipcRenderer.on("save-document", (_, args) => {
    DOMElementsMap.documentName.innerText = args.title;
    DOMElementsMap.documentNameStar.innerText = "";
  });

  ipcRenderer.on("new-document", () => {
    DOMElementsMap.documentName.innerText = "";
    DOMElementsMap.documentNameStar.innerText = "";
  });

  DOMElementsMap.textareaInput.focus();
});
