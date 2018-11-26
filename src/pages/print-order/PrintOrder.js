import React from 'react';
import {Banner, FormLayout, Card} from '@shopify/polaris';
import {OMNAPage} from "../OMNAPage";

export class PrintOrder extends OMNAPage {
    constructor(props) {
        super(props);
        this.state.subTitle = 'Print order documents:';

        this.state.documents = null;
        this.state.loading = true;
        this.state.baseUri = '';
        this.state.currentDocumentSrc = false;

        this.handleOpenDocument = this.handleOpenDocument.bind(this);
        this.printDocument = this.printDocument.bind(this);
        this.loadDocuments = this.loadDocuments.bind(this);

        setTimeout(this.loadDocuments, 0);
    }

    handleOpenDocument(e) {
        e.preventDefault();
        this.loadDocument(e.target.href)
    }

    printDocument(e) {
        e.target.focus();
        e.target.contentWindow.print();
    }

    loadDocument(src) {
        this.loadingOn();
        console.log(src);
        axios({
            url: src, responseType: 'arraybuffer'
        }).then((response) => {
            let blob = new Blob([response.data], { type: response.headers['content-type'] }),
                url = window.URL.createObjectURL(blob),
                iframe = $('.current-print-document');

            iframe.prop('src', url);
        }).catch(
            (error) => this.flashError('Failed to load docuement.' + error)
        ).finally(() => this.loadingOff())
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
        }).fail((response) => {
            const error = response.responseJSON ? response.responseJSON.error : response.responseText;
            this.flashError('Failed to load order print documents from OMNA.' + error);
            this.setState({ documents: [], loading: false });
        }).always(() => this.loadingOff());
    }

    getDocumentUri(doc) {
        return this.state.baseUri + '&type=' + doc.type
    }

    renderCurrentDocument() {
        const { currentDocumentSrc } = this.state;

        if ( !currentDocumentSrc ) return this.renderLoading();

        return <iframe className="current-print-document" onLoad={this.printDocument}></iframe>
    }

    renderDocuments() {
        const { documents } = this.state;

        if ( !documents || documents.length === 0 ) return this.warn('Order print not available...');

        return (
            <div>
                <Card.Section>
                    <FormLayout.Group>
                        {
                            documents.map((doc, idx) =>
                                <Banner key={idx} icon="print">
                                    {this.renderExternalLink(doc.title, this.getDocumentUri(doc), this.handleOpenDocument)}
                                </Banner>
                            )
                        }
                    </FormLayout.Group>
                </Card.Section>
                <Card.Section>
                    {this.renderCurrentDocument()}
                </Card.Section>
            </div>
        )
    }

    renderPageContent() {
        return this.state.loading ? this.renderLoading() : <Card sectioned>{this.renderDocuments()}</Card>
    }

    componentDidUpdate(prevProps) {
        const { documents } = this.state;
        console.log(111, documents);

        if ( documents && documents.length > 0 ) this.loadDocument(this.getDocumentUri(documents[0]))
    }
}