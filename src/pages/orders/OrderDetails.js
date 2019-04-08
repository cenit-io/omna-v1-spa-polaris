import React, { Fragment } from 'react';
import { OMNAPage } from '../OMNAPage';
import { DisplayText, Icon, Card, Layout, Stack, TextStyle, Button } from '@shopify/polaris';

export class OrderDetails extends OMNAPage{
    constructor(props){
        super(props);
        this.state.title = 'Order Details';
        this.state.subTitle = '';

        this.showItemsInfo = this.showItemsInfo.bind(this);
        this.showShipmentsInfo = this.showShipmentsInfo.bind(this);
        this.printOrder = this.printOrder.bind(this);
        this.navigateToOrdersPage = this.navigateToOrdersPage.bind(this);

    }


    showItemsInfo(order){
        let line_items_shipment;
        if (order){
            line_items_shipment = order.line_items.map(({variant, price, quantity}) =>
                <Fragment key={variant.sku}>
                    <Stack distribution="fillEvenly">
                        <div className={"vertical-alignment"}>
                            <TextStyle variation="positive">{variant.name}</TextStyle>
                            <TextStyle variation="subdued">{'SKU: '}{variant.sku}</TextStyle>
                        </div>

                        <p>{'$'}{price}{' x '} {quantity}</p>
                        <p>{'$'}{price}</p>
                    </Stack>
                </Fragment>
            );
        }
        else {
            line_items_shipment = null;
        }

        return line_items_shipment;
    }

    showShipmentsInfo(order) {
        let shipments;

        if(order) {
            shipments = order.shipments.map(({tracking})=>
                <div key={tracking} style={{marginBottom: '5px'}}>
                    <TextStyle variation="subdued">NinjaVan Dispatch tracking</TextStyle>
                    <p>{tracking}</p>
                </div>
            );
        }


        return shipments;
    }

    navigateToOrdersPage(){
        OMNA.render('orders');
    }

    printOrder(order){
        OMNA.render('print-order', order);
    }


    renderPageContent(){

        const { order } = this.props;

        const date = new Date(order.completed_at).toUTCString().split(' ').slice(0, 5).join(' ');

        const  line_items_shipment = this.showItemsInfo(order);

        const shipments = this.showShipmentsInfo(order);

        let icon;

        if ( order.state === 'complete') {
            icon = <Icon source="checkmark" color="greenDark" backdrop={true}/>;
        }
        else{
            if(order.state === 'canceled'){
                icon = <Icon source="circleCancel" color="yellowDark" backdrop={true}/>;
            }
            else{
                icon = <Icon source="alert" color="ink" backdrop={true}/>;
            }
        }


        return (
            <div>
                <div className="header">
                    <Card sectioned>
                        <div style={{marginBottom: '10px'}}>
                            <Button icon="arrowLeft" onClick={()=>this.navigateToOrdersPage()} plain>Orders</Button>
                        </div>
                        <Stack alignment="baseline">
                            <DisplayText size="large">{order.number}</DisplayText>
                            <TextStyle variation="subdued">{date}</TextStyle>
                        </Stack>
                        <div style={{marginTop: '10px'}}>
                            <Button icon="orders" onClick={()=>this.printOrder(order)} plain>Print Order</Button>
                        </div>
                    </Card>

                </div>
                <div className="layout-order-details">
                    <Layout>
                        <Layout.Section>
                            <Card>
                                <Card.Section>
                                    <Stack alignment="leading">
                                        <Stack.Item fill>
                                            <div style={{'display': 'flex'}}>
                                                {icon}
                                                <div style={{marginLeft: '10px'}}>
                                                    <DisplayText size="large">{order.state}</DisplayText>
                                                </div>
                                            </div>
                                            <br/>
                                            <Fragment>
                                                {shipments}
                                            </Fragment>
                                        </Stack.Item>
                                        <Stack.Item>
                                            {order.channel}
                                        </Stack.Item>
                                    </Stack>
                                </Card.Section>

                                <Card.Section>
                                    {line_items_shipment}
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

}