import React from 'react';
import {FormLayout, Checkbox, Card} from '@shopify/polaris';
import {NomenclatureSelectBox} from "../../common/NomenclatureSelectBox";
import {OMNAComponent} from "../../common/OMNAComponent";
import {Utils} from "../../common/Utils";

export class ProductBulkSetCategoryDlg extends OMNAComponent {
    constructor(props) {
        super(props);
        this.state.loading = false;
        this.state.data = this.props.data;
        this.state.channel = this.props.channel;
        this.state.categoryId = null;

        this.handleChange = this.handleChange.bind(this);
        this.handleOnSend = this.handleOnSend.bind(this);
    }

    handleChange(value) {
        this.setState({ categoryId: value })
    }

    handleFailRequest(response) {
        let error = Utils.parseResponseError(response);

        error = error || '(' + response.state() + ')';

        this.flashError('Failed updating products. ' + error);
    }

    handleOnSend() {
        let { categoryId, data, channel } = this.state,
            uri = this.urlTo('product/bulk/update'),
            channelsOn = [], channelsOff = [];

        data = JSON.parse(JSON.stringify(data));
        data.channel = channel;
        data.category = { id: categoryId, attr: Utils.productCategoryAttr(channel) };

        let msg = ['You are sure you want to do the following for selected products:'];

        msg.push('SET CATEGORY: ...');

        Utils.confirm(msg.join('\n'), (confirm) => {
            if ( confirm ) {
                this.loadingOn();
                this.xhr = $.post({
                    url: uri,
                    data: JSON.stringify(data),
                    dataType: 'json',
                    contentType: 'application/json',
                }).done((response) => {
                    this.props.onClose(true)
                }).fail((response) => {
                    this.handleFailRequest(response)
                }).always(this.loadingOff);
            }
        });
    }

    loadingOn() {
        if ( this.state.loading === false ) this.setState({ loading: true });
        super.loadingOn();
    }

    loadingOff() {
        if ( this.state.loading === true ) this.setState({ loading: false });
        super.loadingOff();
    }

    get isValid() {
        return this.state.categoryId !== null
    }

    renderWithAppContext(appContext) {
        let { categoryId, channel, loading } = this.state,
            channelName = this.channelName(channel, false, true);

        return (
            <div className={'omna-dlg modal open rows1'}>
                <Card sectioned title={'Set category to selected products in ' + channelName + ' channel:'}
                      primaryFooterAction={{
                          content: 'Send',
                          icon: 'checkmark',
                          onAction: this.handleOnSend,
                          disabled: !this.isValid || loading
                      }}
                      secondaryFooterAction={{
                          content: 'Cancel',
                          icon: 'cancelSmall',
                          onAction: this.props.onClose,
                          destructive: true,
                          disabled: loading
                      }}>
                    <FormLayout>
                        <NomenclatureSelectBox entity="Category" store={channel} idAttr="category_id"
                                               id={channel + '-category'} label={channelName + " category:"}
                                               value={categoryId} className="category-select-box"
                                               onChange={this.handleChange}/>
                    </FormLayout>
                </Card>
            </div>
        )
    }

    componentDidUpdate(prevProps) {
        let { data: pData } = prevProps,
            { data: cData, channel: cChannel } = this.props;

        if ( JSON.stringify(pData) !== JSON.stringify(cData) ) this.setState({ data: cData, channel: cChannel })
    }
}