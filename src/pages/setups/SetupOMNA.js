import React from "react";
import {
  AccountConnection,
  DescriptionList,
  FooterHelp,
  Card,
  Button,
  Layout,
  List,
  Banner
} from "@shopify/polaris";
import { SetupStore } from "./SetupStore";
import { Utils } from "../../common/Utils";

export class SetupOMNA extends SetupStore {
  constructor(props) {
    super(props);
    this.state.sending = false;
  }

  handleChangePlan = (_, plan) => {
    const { appContext } = this.state;

    plan = plan || appContext.settings.plan;

    this.setState({ sending: true });

    if (plan.status === "pending") {
      open(plan.confirmation_url, "_parent");
    } else if (plan.status === "active") {
      Utils.confirm(
        "Are you sure you want to cancel the (" + plan.name + ") plan?",
        confirmed => {
          if (confirmed) {
            open(this.urlTo("plan/cancel?") + this.queryParams(), "_self");
          } else {
            this.setState({ sending: false });
          }
        }
      );
    } else {
      open(
        this.urlTo("plan/active?") + this.queryParams({ plan: plan.name }),
        "_self"
      );
    }
  };

  get currentPlanItems() {
    const appContext = this.state.appContext,
      plan = appContext.settings.plan || {},
      metadata = plan.metadata || {};

    if (plan.status === "active" || plan.status === "pending") {
      return (
        <div>
          <List>
            <List.Item>
              Shop Domain: {appContext.settings.shop_domain}
            </List.Item>
            <List.Item>Name: {plan.name}</List.Item>
            <List.Item>Status: {plan.status}</List.Item>
            <List.Item>Activated On: {plan.activated_on}</List.Item>
            <List.Item>Balance Used: {plan.balance_used}</List.Item>
          </List>
        </div>
      );
    } else {
      return (
        <div>
          <List>
            <List.Item>
              Shop Domain: {appContext.settings.shop_domain}
            </List.Item>
          </List>
        </div>
      );
    }
  }

  renderPlans(appContext) {
    return (
      <Layout>
        {appContext.settings.plans_data.map((plan, idx) => {
          return (
            <Layout.Section key={idx} oneThird>
              <Banner
                title={plan.name}
                status={idx % 2 == 0 ? "success" : "info"}
                icon="chevronRight"
              >
                <DescriptionList
                  items={[
                    { term: "Price:", description: plan.price },
                    {
                      term: "Cost by order:",
                      description: plan.cost_by_order
                    },
                    // { term: 'Order limit:', description: plan.order_limit },
                    {
                      term: "Capped amount:",
                      description: plan.capped_amount
                    },
                    { term: "Trial days:", description: plan.trial_days },
                    { term: "Terms:", description: plan.terms }
                  ]}
                />
                <Button
                  primary
                  onClick={e => this.handleChangePlan(e, plan)}
                >{`Take the ${plan.name} plan`}</Button>

                {/* <Card
                  sectioned
                  key={idx}
                  primaryFooterAction={{
                    content: "Take the " + plan.name + " plan",
                   
                  }}
                >
                  
                </Card> */}
              </Banner>
            </Layout.Section>
          );
        })}
      </Layout>
    );
  }

  renderWithAppContext(appContext) {
    let action,
      details,
      destructive = false,
      connected = false,
      icon = "checkmark",
      plan = appContext.settings.plan;

    if (plan.status === "pending") {
      action = "Confirm";
      details = Utils.warn("The selected plan is pending confirmation");
    } else if (plan.status === "active") {
      connected = true;
      action = "Cancel";
      details = Utils.success("Is activated");
      destructive = true;
      icon = "cancelSmall";
    } else {
      action = false;
      details = Utils.warn("Not yet subscribed to any plan");
    }

    return (
      <div
        className={
          "setup sale-channel OMNA " +
          (connected ? "connected" : "disconnected")
        }
      >
        <AccountConnection
          connected={connected}
          details={details}
          accountName="Current plan"
          action={
            action && {
              content: action,
              destructive: destructive,
              disabled: this.state.sending,
              icon: icon,
              onAction: this.handleChangePlan
            }
          }
          termsOfService={Utils.info(
            "Details:",
            // <DescriptionList items={this.currentPlanItems} />
            <div>{this.currentPlanItems}</div>
          )}
        />
        <Card sectioned title="Available plans">
          {this.renderPlans(appContext)}
        </Card>
        <FooterHelp>
          {"Learn more about "}
          {Utils.renderExternalLink("how configure", this.state.helpUri)}
          {" status."}
        </FooterHelp>
      </div>
    );
  }
}
