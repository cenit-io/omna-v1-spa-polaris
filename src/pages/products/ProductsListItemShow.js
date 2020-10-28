import React from 'react';
import { Stack, TextStyle, Card, ResourceList, Thumbnail, Badge, Button } from '@shopify/polaris';
import { Utils } from "../../common/Utils";
import { OMNAComponent } from "../../common/OMNAComponent";
import { ResourceItemContext } from "../../common/ResourceItemContext";

export class ProductsListItemShow extends OMNAComponent {
  constructor(props) {
    super(props);

    this.product = null;
    this.singleFilterChannel = null;
  }

  handleItemClick = (itemId) => {
    let items = Utils.productItems.items,
      index = items.findIndex((item) => item.ecommerce_id === itemId);

    Utils.renderPage('product', { product: items[index], products: items, productIndex: index });
  };

  handleSetCategoryFilter = (e) => {
    this.props.onCategoryClick(this.productCategoryItem);
    e.stopPropagation();
  };

  handleSetChannelFilter(channel) {
    return (e) => {
      this.props.onChannelClick(channel);
      e.stopPropagation();
    }
  }

  get productCategoryId() {
    let sd = (Utils.productItems.storeDetails || []).find((sd) => sd.ecommerce_id === this.product.ecommerce_id);

    return sd ? sd[Utils.productCategoryAttr(this.singleFilterChannel)] : null;
  }

  get productCategoryItem() {
    let categoryId, channel = this.singleFilterChannel;

    if (!channel) return;

    categoryId = this.productCategoryId;

    if (!window.categories || !window.categories[channel]) {
      window.categories = {};
      window.categories[channel] = true;
    }

    let item = categoryId ? window.categories[categoryId] : {
        category_id: 'not defined',
        name: 'Category is not defined'
      },
      waitingId = channel + categoryId;

    if (!item || !item.name) {
      window.categories[categoryId] = item = { category_id: categoryId };
      if (!Utils.isWaitingResponse(waitingId)) {
        this.loadingOn();
        this.xhr = $.getJSON({
          url: this.urlTo('nomenclatures'),
          xhrFields: { withCredentials: true },
          data: this.requestParams({
            entity: 'Category', sch: channel, idAttr: 'category_id', textAttr: 'name', id: categoryId
          })
        }).done((response) => {
          window.categories[categoryId] = response.item;
        }).fail((response) => {
          this.flashError('Failed to load ' + channel + ' category. ' + Utils.parseResponseError(response));
        }).always((response) => {
          this.loadingOff();
          Utils.releaseWaitResponse(waitingId, response);
        });
      }
      Utils.waitResponse(waitingId, (response) => this.setState({ loading: false }));
    }

    return item;
  }

  isAvailableChannel(name) {
    return this.activeChannels.find((channel) => channel.name === name)
  }

  renderStoreWithStatus(sch, idx) {
    if (!this.isAvailableChannel(sch.channel)) return;

    let syncStatus = sch.sync_task ? sch.sync_task.status : null,
      status, tip, progress, hasErrors, verb,
      channelName = this.channelName(sch.channel, false, true);

    if (syncStatus) {
      hasErrors = sch.notifications.find((n) => n.status === 'critical');

      if (hasErrors) syncStatus = 'failed';

      switch ( syncStatus ) {
        case 'pending':
          status = 'attention';
          progress = 'incomplete';
          break;
        case 'running':
          status = 'info';
          progress = 'partiallyComplete';
          break;
        case 'completed':
          status = 'success';
          progress = 'complete';
          break;
        default:
          status = 'warning';
          progress = 'incomplete';
      }

      verb = syncStatus.match(/ed$/) ? ' has ' : ' is ';
      tip = 'Synchronize process with ' + channelName + verb + syncStatus + '.';
    } else {
      status = 'new';
      tip = 'It has never been synchronized with ' + channelName + '.'
    }

    return (
      <Badge status={status} progress={progress} key={idx}>
        <div title={tip}>
          <Button fullWidth={true} plain={true} onClick={this.handleSetChannelFilter(sch.channel)}>
            {channelName}
          </Button>
        </div>
      </Badge>
    )
  }

  renderStores(product) {
    let salesChannels = product.sales_channels || [];

    salesChannels.sort((a, b) => a.channel < b.channel ? -1 : 1);

    if (salesChannels.length > 0) {
      return (
        <Stack distribution="trailing" wrap="false">
          <TextStyle variation="positive">
            {salesChannels.length === 1 ? 'Sales channel' : 'Sales channels'}:
          </TextStyle>;
          <Stack distribution="leading" spacing="extraTight" wrap="false">
            {salesChannels.map((sch, idx) => this.renderStoreWithStatus(sch, idx))}
          </Stack>
        </Stack>
      )
    }
  }

  renderCategory() {
    let category, tip;

    if ((category = this.productCategoryItem)) {
      tip = this.channelName(this.singleFilterChannel, false, true) + ' category';

      return (
        <Badge status={category.category_id ? 'new' : 'warning'}>
          <div title={tip}>
            <Button fullWidth={true} plain={true} onClick={this.handleSetCategoryFilter}>
              {category.name || Utils.renderLoading('small')}
            </Button>
          </div>
        </Badge>
      )
    }
  }

  renderTitle() {
    let price = this.product.variants[0].price,
      variants = Utils.variants(this.product, false),
      vLabel = variants.length === 1 ? 'variant' : 'variants';

    return (
      <Stack distribution="fill" wrap="false">
        <TextStyle variation="strong">{this.product.title}</TextStyle>
        <Stack distribution="trailing" wrap="false">
          {this.renderCategory()}
          <Badge status="new">
            <TextStyle variation="positive">{variants.length}{' '}{vLabel}</TextStyle>
          </Badge>
          <Badge status="new"><TextStyle variation="positive">${price}</TextStyle></Badge>
        </Stack>
      </Stack>
    )
  }

  renderItem(itemContext) {
    this.product = itemContext.product;
    this.singleFilterChannel = itemContext.singleFilterChannel;

    let img = Utils.defaultImage(this.product);

    return (
      <ResourceList.Item
        id={this.product.ecommerce_id}
        media={img ? <Thumbnail source={img.small} alt={this.product.title} /> : ''}
        onClick={this.handleItemClick}>

        <Card sectioned title={this.renderTitle()}>{this.renderStores(this.product)}</Card>
      </ResourceList.Item>
    );
  }

  renderWithAppContext(appContext) {
    return <ResourceItemContext.Consumer>{(itemContext) => this.renderItem(itemContext)}</ResourceItemContext.Consumer>
  }
}
