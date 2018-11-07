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

        this.handleOpenPage = this.handleOpenPage.bind(this);
        this.loadDocuments = this.loadDocuments.bind(this);

        setTimeout(this.loadDocuments, 0);
    }

    handleOpenPage(e) {
        e.preventDefault();

        this.loadingOn();
        axios({
            url: e.target.href,
            responseType: 'arraybuffer'
        }).then((response) => {
            let blob = new Blob([response.data], { type: response.headers['content-type'] }),
                url = window.URL.createObjectURL(blob),
                w = open(url, '_blank');

            w.focus();
            w.print();
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

    renderDocuments() {
        const { documents, baseUri } = this.state;

        if ( !documents || documents.length === 0 ) return this.warn('Order print not available...');

        return (
            <FormLayout.Group>
                {
                    documents.map((doc, idx) =>
                        <Banner key={idx} icon="print">
                            {this.renderExternalLink(doc.title, baseUri + '&type=' + doc.type, this.handleOpenPage)}
                        </Banner>
                    )
                }
            </FormLayout.Group>
        )
    }

    renderPageContent() {
        return this.state.loading ? this.renderLoading() : <Card sectioned>{this.renderDocuments()}</Card>
    }
}