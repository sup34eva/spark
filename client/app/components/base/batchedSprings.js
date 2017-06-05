// @flow
import React, { Element } from 'react';
import rebound from 'rebound';
import VisibilitySensor from 'react-visibility-sensor';

import batch from 'utils/batch';

const system = new rebound.SpringSystem();

type Props = {
    children: ({ [key: string]: number }) => Element<*>;
    springs: {
        [key: string]: {
            tension: number,
            friction: number,
            start: number,
            end: number,
        },
    };
};

export default class BatchedSprings extends React.Component {
    constructor(props: Props) {
        super(props);

        this.springs = {};
        this.state = {
            isVisible: false,
            isAtRest: false,
            springs: Object.entries(props.springs).reduce((state, [key, { start }]) => ({
                ...state,
                [key]: start,
            }), {}),
        };
    }

    state: {
        isVisible: boolean,
        isAtRest: boolean,
        springs: {
            [key: string]: number,
        },
    };

    componentWillMount() {
        this.onVisibilityChange = isVisible => {
            this.setState({ isVisible });
        };
    }

    componentDidMount() {
        this.batch = batch(index => {
            this.timeout = setTimeout(() => {
                Object.entries(this.props.springs).forEach(([key, { tension, friction, end }]) => {
                    const spring = system.createSpring(tension, friction);
                    spring.addListener({
                        onSpringUpdate: () => {
                            if (this.state.isVisible) {
                                this.setState(state => ({
                                    springs: {
                                        ...state.springs,
                                        [key]: spring.getCurrentValue(),
                                    },
                                }));
                            }
                        },
                        onSpringAtRest: () => {
                            this.setState(state => ({
                                isAtRest: true,
                                springs: {
                                    ...state.springs,
                                    [key]: spring.getCurrentValue(),
                                },
                            }));
                        },
                    });

                    spring.setCurrentValue(this.state.springs[key], true);
                    spring.setEndValue(end);

                    this.springs[key] = spring;
                });
            }, index * 25);
        });
    }

    componentWillUnmount() {
        if (this.batch) {
            this.batch.cancel();
            this.batch = null;
        }
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }

        Object.entries(this.springs).forEach(([key, spring]) => {
            spring.destroy();
            delete this.springs[key];
        });
    }

    batch: any;
    timeout: any;
    springs: {
        [key: string]: Object,
    };

    props: Props;

    render() {
        return (
            <VisibilitySensor
                active={!this.state.isAtRest}
                partialVisibility resizeCheck scrollCheck
                onChange={this.onVisibilityChange}>
                {this.props.children(this.state.springs)}
            </VisibilitySensor>
        );
    }
}

export const PRESET_ZOOM = {
    opacity: {
        tension: 60,
        friction: 5,
        start: 0,
        end: 1,
    },
    scale: {
        tension: 40,
        friction: 3,
        start: 0.2,
        end: 1,
    },
};
