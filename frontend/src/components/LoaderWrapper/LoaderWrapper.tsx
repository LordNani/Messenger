import React from 'react';
import styles from './LoaderWrapper.module.sass';
import loader from '../../assets/loader.gif';

interface IOwnProps {
    loading: boolean;
}

class LoaderWrapper extends React.Component<IOwnProps> {
    render() {
        return this.props.loading
            ?(
                <div className={styles.wrapper}>
                    <img src={loader} alt="loading" className={styles.loader} />
                </div>
            ) : (
                <>
                    {this.props.children}
                </>
            );
    }
}

export default LoaderWrapper;
