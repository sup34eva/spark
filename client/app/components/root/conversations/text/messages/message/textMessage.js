// @flow
import React from 'react';
import marked from 'marked';

import styles from './message.css';

marked.setOptions({
    gfm: true,
    breaks: true,
    tables: false,
    smartLists: false,
    sanitize: true,
});

type Props = {
    content: string,
};

export default (props: Props) => (
    // eslint-disable-next-line react/no-danger
    <div className={styles.content} dangerouslySetInnerHTML={{ __html: marked(props.content) }} />
);
