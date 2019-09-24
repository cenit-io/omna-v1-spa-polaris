import React, {Fragment} from 'react';
import {OMNAPage} from '../OMNAPage';
import {Utils} from '../../common/Utils';
import {DisplayText, Icon, Card, Layout, Stack, TextStyle, Button, Badge, Thumbnail} from '@shopify/polaris';

const LineItem = ({ image, price, quantity, name, sku }) => (
    <Stack distribution="fillEvenly">
        {image ? <Thumbnail source={image} alt="Black choker necklace"/> : ''}
        <div className="vertical-alignment">
            <TextStyle variation="positive">{name}</TextStyle>
            <TextStyle variation="subdued">{`SKU: ${sku}`}</TextStyle>
        </div>
        <p>{`$${price} x ${quantity}`}</p>
        <p>{`$${price}`}</p>
    </Stack>
);


export class OrderDetails extends OMNAPage {
    constructor(props) {
        super(props);

        this.state.title = 'Order Details';
        this.state.subTitle = '';
        this.state.imageItems = [];
    }

    componentDidMount() {
        this.getLineItemImage();
    }

    handleImageItems(imageItems) {
        if (this.nodeRef) this.setState({ imageItems });
    }

    getLineItemImage() {
        let items = this.props.order.line_items;
        let images = [];
        items.forEach((item) => {
            let data = this.requestParams({
                sku: item.sku, sch: 'Shopify'
            });
            let uri = this.urlTo('product/show');
            this.loadingOn();
            this.setState({ imageLoading: true });
            this.xhr = $.getJSON({
                url: uri,
                data: data,
                xhrFields: { withCredentials: true }
            }).done((response) => {
                let variants = response.product.variants;
                if (variants) {
                    let variant = variants.find((element) => element.sku === item.sku);
                    if (variant) {
                        images.push({ sku: variant.sku, srcImage: variant.images ? variant.images[0].src : null });
                        this.handleImageItems(images);
                    }
                }
            }).fail((response) => {
                this.flashError('Failed to load line items details from OMNA. ' + Utils.parseResponseError(response));
            }).always(() => {
                this.setState({ imageLoading: false });
                this.loadingOff();
            });

        });
    }


    icon(status) {
        switch ( status ) {
            case ('complete'):
                return <Icon source="checkmark" color="greenDark" backdrop={true}/>;
            case 'completed':
                return <Icon source="checkmark" color="greenDark" backdrop={true}/>;
            case 'fulfilled':
                return <Icon source="checkmark" color="greenDark" backdrop={true}/>;
            case 'paid':
                return <Icon source="checkmark" color="greenDark" backdrop={true}/>;
            case 'ready':
                return <Icon source="checkmark" color="greenDark" backdrop={true}/>;
            case 'canceled':
                return <Icon source="circleCancel" color="yellowDark" backdrop={true}/>;
            case 'pending':
                return <Icon source="refresh" color="tealDark" backdrop={true}/>;
            case 'unfulfilled':
                return <Icon source="refresh" color="yellowDark" backdrop={true}/>;
            default:
                return <Icon source="alert" color="ink" backdrop={true}/>;

        }
    }


    showItemsInfo(order) {
        let container = '';
        let { imageItems, imageLoading } = this.state;

        if (order) {
            let image = { sku: null, srcImage: null };
            order.line_items.map(({ variant, price, quantity, sku }, index) => {
                if (imageItems.length > 0) {
                    image = imageItems.find((item) => item.sku === sku);
                }

                container =
                    <Fragment key={index}>
                        {!imageLoading ?
                            <LineItem image={image.srcImage} name={variant.name} price={price} quantity={quantity}
                                      sku={sku}/> : Utils.renderLoading("small", "Loading items...")}
                    </Fragment>
            })
        }

        return container;
    }

    showShipmentsInfo(order) {
        let shipments;

        if (order) {
            shipments = order.shipments.map(({ tracking, state }, index) =>
                <div className="margin-bottom-5px" key={index}>
                    <TextStyle variation="subdued">NinjaVan Dispatch tracking</TextStyle>
                    <p>{tracking}</p>
                </div>
            );
        }

        return shipments;
    }

    showPaymentInfo(order) {
        let section;
        let payments;

        if (order) {
            payments = order.payments.map(({ amount, state }, index) =>
                <div className="margin-bottom-5px" key={index}>
                    <div className="display-flex justify-content-space-between">
                        <p>amount</p>
                        <p>{`$${amount}`}</p>
                        {order.shopify_financial_status ? '' : <Badge>{state}</Badge>}
                    </div>
                </div>
            );

            section = <Fragment>
                {order.shopify_financial_status ? '' : <div><DisplayText size="small">Payment</DisplayText></div>}
                {payments}
            </Fragment>;
        }

        return section;
    }


    handleBackToOrdersPage = () => Utils.renderPage('orders');

    handlePrintOrder = (order) => () => Utils.renderPage('print-order', order);

    renderPageContent() {

        const { order } = this.props;

        const date = new Date(order.completed_at).toUTCString().split(' ').slice(0, 5).join(' ');

        const line_items_shipment = this.showItemsInfo(order);

        const shipments = this.showShipmentsInfo(order);

        const payments = this.showPaymentInfo(order);

        let shopify_sate;

        let channel_sate;

        let financial_state;

        if (order.shopify_state) {
            shopify_sate = <div className="display-flex align-items-center">
                <TextStyle>Shopify State:</TextStyle>
                <Badge progress={Utils.progress(order.shopify_status)}
                       status={Utils.status(order.shopify_state)}>{order.shopify_state}</Badge>
            </div>;
        }

        if (order.channel_state) {
            channel_sate = <div className="display-flex align-items-center">
                <TextStyle>Channel State:</TextStyle>
                <Badge>{order.channel_state}</Badge>
            </div>;
        }

        if (order.shopify_financial_status) {
            financial_state =
                <div className="horizontal-alignment margin-status-text margin-bottom-10px">
                    {this.icon(order.shopify_financial_status)}
                    <div>
                        <DisplayText element="h2" size="small">{order.shopify_financial_status}</DisplayText>
                    </div>
                </div>;
        }

        return (
            <div ref={e => {
                this.nodeRef = e
            }}>
                <div>
                    <Card sectioned>
                        <div className="display-flex justify-content-space-between margin-bottom-10px">
                            <Button icon="arrowLeft" onClick={this.handleBackToOrdersPage} plain>Orders</Button>
                            <Button icon="orders" onClick={this.handlePrintOrder(order)} plain>Print Order</Button>
                        </div>
                        <Stack alignment="baseline">
                            <DisplayText size="large">{order.number}</DisplayText>
                            <TextStyle variation="subdued">{date}</TextStyle>
                        </Stack>
                    </Card>

                </div>
                <div className="layout-main-body-details">
                    <Layout>
                        <Layout.Section>
                            <Card>
                                <Card.Section>
                                    <div className="display-flex flex-direction-row-reverse margin-right-8px">
                                        {order.channel}
                                    </div>
                                    <div className="display-flex justify-content-space-between">
                                        {shopify_sate}
                                        {channel_sate}
                                    </div>

                                    <Stack>
                                        <Fragment>
                                            {shipments}
                                        </Fragment>
                                    </Stack>
                                </Card.Section>

                                <Card.Section>
                                    {line_items_shipment}
                                </Card.Section>
                            </Card>
                            <Card>
                                <Card.Section>
                                    {financial_state}
                                    {payments}
                                </Card.Section>
                            </Card>
                        </Layout.Section>

                        <Layout.Section secondary>
                            <Card sectioned>
                                <Card.Section title="Customer">
                                    <p>{order.customer.firstname}</p>
                                </Card.Section>
                                <Card.Section title="Shipping Address">
                                    <p>{order.ship_address.firstname}</p>
                                    <p>{order.ship_address.address1}</p>
                                    <p>{order.ship_address.city}{' '} {order.ship_address.zipcode}</p>
                                    <p>{order.ship_address.country.name}</p>
                                </Card.Section>
                            </Card>
                        </Layout.Section>
                    </Layout>
                </div>
            </div>
        );
    }

    renderNotifications() {
        return super.renderNotifications('Order', 'Shopify', this.props.order.number, true);
    }
}