import React from 'react';
import {Banner, FormLayout, Card} from '@shopify/polaris';
import {OMNAPage} from "../OMNAPage";
import {Utils} from "../../common/Utils";

export class PrintOrder extends OMNAPage {
    constructor(props) {
        super(props);
        this.state.subTitle = 'Print order documents:';

        this.state.documents = [];
        this.state.loading = true;
        this.state.baseUri = '';
        this.state.currentDocumentBlob = false;
        this.state.currentDocumentUri = false;

        this.handleOpenDocument = this.handleOpenDocument.bind(this);
        this.printDocument = this.printDocument.bind(this);
        this.loadDocuments = this.loadDocuments.bind(this);

        setTimeout(this.loadDocuments, 0);
    }

    handleOpenDocument(e) {
        e.preventDefault();

        if ( this.state.currentDocumentUri != e.target.href ) return this.loadDocument(e.target.href);

        $('.current-print-document').each((_, iframe) => {
            iframe.focus();
            iframe.contentWindow.print();
        });

    }

    printDocument(e) {
        e.target.focus();
        e.target.contentWindow.print();
    }

    loadDocument(uri) {
        this.loadingOn();
        this.setState({ currentDocumentUri: uri });
        this.setState({ currentDocumentBlob: false });
        axios({
            url: uri, responseType: 'arraybuffer'
        }).then((response) => {
            this.setState({ currentDocumentBlob: new Blob([response.data], { type: response.headers['content-type'] }) })
        }).catch(
            (error) => this.flashError('Failed to load docuement.' + error)
        ).finally(this.loadingOff)
    }

    loadDocuments() {
        const uri = this.urlTo('order/print') + window.location.search + '&format=json';

        this.loadingOn();
        $.getJSON(uri).done((response) => {
            this.setState({
                documents: response.documents,
                baseUri: response.base_uri,
                subTitle: 'Print documents of order ' + response.order.name + ' from ' + response.order.source_name + ':',
                loading: false
            });
            if ( response.documents.length > 0 ) this.loadDocument(this.getDocumentUri(response.documents[0]))
        }).fail((response) => {
            this.flashError('Failed to load order print documents from OMNA. ' + Utils.parseResponseError(response));
            this.setState({ documents: [], loading: false });
        }).always(this.loadingOff);
    }

    getDocumentUri(doc) {
        return this.state.baseUri + '&type=' + doc.type
    }

    renderCurrentDocument() {
        const { currentDocumentBlob } = this.state;

        if ( !currentDocumentBlob ) return Utils.renderLoading();

        const src = window.URL.createObjectURL(currentDocumentBlob);

        return <iframe className="current-print-document" src={src} onLoad={this.printDocument}></iframe>
    }

    renderDocuments() {
        const { documents } = this.state;

        if ( !documents || documents.length === 0 ) return Utils.warn('Order print not available...');

        return (
            <div>
                <Card.Section>
                    <FormLayout.Group>
                        {
                            documents.map((doc, idx) =>
                                <Banner key={idx} icon="print">
                                    {Utils.renderExternalLink(doc.title, this.getDocumentUri(doc), this.handleOpenDocument)}
                                </Banner>
                            )
                        }
                    </FormLayout.Group>
                </Card.Section>
                <Card.Section>{this.renderCurrentDocument()}</Card.Section>
            </div>
        )
    }

    renderPageContent() {
        return this.state.loading ? Utils.renderLoading() : <Card sectioned>{this.renderDocuments()}</Card>
    }
}