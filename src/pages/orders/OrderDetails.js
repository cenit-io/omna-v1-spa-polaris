import React, { Fragment } from 'react';
import { OMNAPage } from '../OMNAPage';
import { DisplayText, Icon, Card, Layout, FormLayout, Stack, Subheading, Badge, TextStyle, Button } from '@shopify/polaris';
import { Icons  } from '../../common/Icons';

export class OrderDetails extends OMNAPage{
    constructor(props){
        super(props);
        this.state.title = 'Order Details';
        this.state.subTitle = '';

        this.showShipmentItems = this.showShipmentItems.bind(this);

    }

    showShipmentItems(order){
        const line_items_shipment = order.line_items.map(({variant, price, quantity}) =>
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
        return line_items_shipment;
    }


    renderPageContent(){

        const { order } = this.props;

        const date = new Date(order.completed_at).toUTCString().split(' ').slice(0, 5).join(' ');

        const line_items_shipment = this.showShipmentItems(order);

        return (
            <div>
                <div className="header">
                    <Card sectioned>
                        <Stack alignment="baseline">
                            <DisplayText size="large">{order.number}</DisplayText>
                            <TextStyle variation="subdued">{date}</TextStyle>

                        </Stack>
                        <div style={{marginTop: '10px'}}>
                                <div style={{color: '#bf0711'}}>
                                <Button icon="orders" plain>Print Orders</Button>
                                </div>
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
                                                <Icon source="checkmark" color="green" backdrop={true}/>
                                                <div style={{marginLeft: '10px'}}>
                                                    <DisplayText size="large">{order.state}</DisplayText>
                                                </div>

                                            </div>
                                            <br/>
                                            <TextStyle variation="subdued">NinjaVan Dispatch tracking</TextStyle><br/>
                                            <p>454654564ER98AZ</p>
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
                <div className="delete">

                </div>

            </div>
        );
    }

}