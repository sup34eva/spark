// @flow
import React, { Element } from 'react';
import rebound from 'rebound';

import batch from '../../utils/batch';

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

        this.state = Object.keys(props.springs)
            .reduce((state, key) => {
                const { start } = props.springs[key];
                return {
                    ...state,
                    [key]: start,
                };
            }, {});
    }

    state: {
        [key: string]: number,
    };

    componentDidMount() {
        this.batch = batch(index => {
            this.timeout = setTimeout(() => {
                Object.keys(this.props.springs).forEach(key => {
                    // eslint-disable-next-line react/prop-types
                    const { tension, friction, end } = this.props.springs[key];

                    const spring = system.createSpring(tension, friction);
                    spring.addListener({
                        onSpringUpdate: () => {
                            this.setState({
                                [key]: spring.getCurrentValue(),
                            });
                        },
                    });

                    spring.setCurrentValue(this.state[key], true);
                    spring.setEndValue(end);

                    // $FlowIssue
                    this[key] = spring;
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

        Object.keys(this.props.springs).forEach(key => {
            // $FlowIssue
            if (this[key]) {
                this[key].destroy();
                // $FlowIssue
                this[key] = null;
            }
        });
    }

    batch: any;
    timeout: any;

    props: Props;

    render() {
        return this.props.children(this.state);
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
