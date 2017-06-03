// @flow
import React, { Component } from 'react';
import { TabRouter, addNavigationHelpers } from 'react-navigation';

import Conversations from 'components/list/conversations';

import styles from '../app.css';

import Conversation from './conversation';

export const DetailsRouter = new TabRouter({
    ConvClose: {
        screen: () => null,
    },
    ConvOpen: {
        screen: Conversation,
    },
});

export default class DetailsNavigator extends Component {
    static router = DetailsRouter;

    props: {
        navigation: {
            /* eslint-disable react/no-unused-prop-types */
            dispatch: () => void,
            state: {
                index: number,
                routes: Array<Object>,
            },
            /* eslint-enable react/no-unused-prop-types */
        },
    };

    render() {
        const rootNavigation = this.props.navigation;
        const { state, dispatch } = rootNavigation;
        const { routes, index } = state;

        const route = routes[index];
        const childNavigation = addNavigationHelpers({ dispatch, state: route });
        const ChildComponent = DetailsRouter.getComponentForRouteName(route.routeName);

        return (
            <div className={styles.convNavigator}>
                <Conversations routeName={state.routeName} navigation={childNavigation} />
                <ChildComponent navigation={childNavigation} />
            </div>
        );
    }
}
