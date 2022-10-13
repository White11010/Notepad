import {ipcRenderer} from 'electron';
import {EMainCustomEvents, ERendererCustomEvents} from './models/custom-events-enums';
import {ISaveDocumentEventPayload} from './models/renderer-process-events';
import {IDocumentOpenedEventPayload, IDocumentSavedEventPayload} from './models/main-process-events';

window.addEventListener('DOMContentLoaded', () => {
	const DOMElementsMap = {
		saveDocumentButton: document.getElementById('save-button'),
		createDocumentButton: document.getElementById('new-button'),
		openDocumentButton: document.getElementById('open-button'),
		closeApplicationButton: document.getElementById('close-button'),
		textareaInput: document.getElementById('textarea-input') as HTMLInputElement,
		documentName: document.getElementById('document-name'),
		documentNameStar: document.getElementById('document-name-star'),
	};

	// DOM elements event listeners
	DOMElementsMap.saveDocumentButton.addEventListener('click', () => {
		ipcRenderer.send(
			ERendererCustomEvents.SAVE_DOCUMENT,
			{
				inputText: DOMElementsMap.textareaInput.value,
			} as ISaveDocumentEventPayload
		);
	});

	DOMElementsMap.openDocumentButton.addEventListener('click', () => {
		ipcRenderer.send(ERendererCustomEvents.OPEN_DOCUMENT);
	});

	DOMElementsMap.createDocumentButton.addEventListener('click', () => {
		ipcRenderer.send(ERendererCustomEvents.CREATE_NEW_DOCUMENT);
		DOMElementsMap.textareaInput.value = '';
	});

	DOMElementsMap.closeApplicationButton.addEventListener('click', () => {
		ipcRenderer.send(ERendererCustomEvents.CLOSE_APPLICATION);
	});

	DOMElementsMap.textareaInput.addEventListener('input', () => {
		DOMElementsMap.documentNameStar.innerText = '*';
	});

	// Renderer event listeners
	ipcRenderer.on(EMainCustomEvents.DOCUMENT_OPENED, (_, args: IDocumentOpenedEventPayload) => {
		DOMElementsMap.textareaInput.value = args.text;
		DOMElementsMap.documentName.innerText = args.title;
	});

	ipcRenderer.on(EMainCustomEvents.DOCUMENT_SAVED, (_, args: IDocumentSavedEventPayload) => {
		DOMElementsMap.documentName.innerText = args.title;
		DOMElementsMap.documentNameStar.innerText = '';
	});

	ipcRenderer.on(EMainCustomEvents.NEW_DOCUMENT_CREATED, () => {
		DOMElementsMap.documentName.innerText = '';
		DOMElementsMap.documentNameStar.innerText = '';
	});

	DOMElementsMap.textareaInput.focus();
});
