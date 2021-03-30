import { PageHeader, Radio, List, Spin } from 'antd';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { setGlobalState } from '../../redux/ActionCreators';
import styled from 'styled-components';
import ColorPickerPopup from '../ColorPickerPopup';
import Utils from '../../../common/helpers/Utils';
import HTTP from '../../../common/helpers/HTTP';
import Routes from '../../../common/helpers/Routes';
import Constants from '../../../common/helpers/Constants';
import PropTypes from 'prop-types';

const { Item } = List;

const StyledListItem = styled(Item)`
padding: 16px 0px !important;
`;

const Themes = (props) => {
    const [loading, setLoading] = useState(false);
    const [colorPickerVisible, setColorPickerVisible] = useState(false);
    const [currentSettingToChange, setCurrentSettingToChange] = useState(null);

    const colorPickerSubmitCallback = (color) => {
        submitData(Constants.settings.ACCENT_COLOR, color);
    }

    const colorPickerOnChange = (colorObject) => {
        const color = colorObject.hex;

        props.setGlobalState({
            accentColor: color
        });
        document.documentElement.style.setProperty('--z-accent-color', color);
        Utils.changeAccentColor(color);
    }

    const submitData = (name, value, callback = null) => {
        if (!loading) {
            setLoading(true);
        }

        setCurrentSettingToChange(name);

        HTTP.post(Routes.api.admin.settings, {
            name: name,
            setting_value: value
        })
        .then(response => {
            Utils.handleSuccessResponse(response, () => {
                if (callback) {
                    callback();
                }
            })
        })
        .catch(error => {
            Utils.handleException(error);
        })
        .finally(() => {
            setLoading(false);
        });
    }

    const menuLayoutChangeHandle = (e) => {
        const value = e.target.value;

        const callback = () => {
            props.setGlobalState({
                menuLayout: value
            });
        }
        submitData(Constants.settings.MENU_LAYOUT, value, callback);
    }

    const shortMenuChangeHandle = (e) => {
        const value = e.target.value;

        const callback = () => {
            props.setGlobalState({
                shortMenu: value
            });
        }
        submitData(Constants.settings.SHORT_MENU, value, callback);
    }

    return (
        <React.Fragment>
            <PageHeader
                title="Theme Settings"
            >
                <List
                    itemLayout="horizontal"
                    size="large"
                >
                    <Spin size="small" spinning={loading && currentSettingToChange === Constants.settings.ACCENT_COLOR}>
                        <StyledListItem actions={
                            [
                                <a 
                                    key="site-name-change" 
                                    onClick={() => {
                                        setColorPickerVisible(true);
                                    }}
                                >
                                    Change
                                </a>,
                            ]
                        }>
                            <Item.Meta title={'Accent Color'} description={'Change accent color of app.'} />
                        </StyledListItem>
                    </Spin>
                    <Spin size="small" spinning={loading && currentSettingToChange === Constants.settings.MENU_LAYOUT}>
                        <StyledListItem actions={
                            [
                                <Radio.Group
                                    key="change-menu-layout"
                                    size="small"
                                    options={
                                        [
                                            { label: 'Side', value: 'mix' },
                                            { label: 'Top', value: 'top' },
                                        ]
                                    }
                                    onChange={menuLayoutChangeHandle}
                                    value={props.globalState.menuLayout}
                                    optionType="button"
                                    buttonStyle="solid"
                                />
                            ]
                        }>
                            <Item.Meta title={'Menu Layout'} description={'Change menu style.'} />
                        </StyledListItem>
                    </Spin>
                    {
                        props.globalState.menuLayout === 'mix' && (
                            <Spin size="small" spinning={loading && currentSettingToChange === Constants.settings.SHORT_MENU}>
                                <StyledListItem actions={
                                    [
                                        <Radio.Group
                                            key="change-short-menu"
                                            size="small"
                                            options={
                                                [
                                                    { label: 'Yes', value: true },
                                                    { label: 'No', value: false },
                                                ]
                                            }
                                            onChange={shortMenuChangeHandle}
                                            value={props.globalState.shortMenu}
                                            optionType="button"
                                            buttonStyle="solid"
                                        />
                                    ]
                                }>
                                    <Item.Meta title={'Short Menu'} description={'Choose left side menu should be expanded or short when layout is sided.'} />
                                </StyledListItem>
                            </Spin>
                        )
                    }
                </List>
            </PageHeader>
            {
                colorPickerVisible && (
                    <ColorPickerPopup
                        selectedColor={props.globalState.accentColor}
                        visible={colorPickerVisible}
                        handleCancel={
                            () => {
                                setColorPickerVisible(false);
                            }
                        }
                        submitCallback={colorPickerSubmitCallback}
                        colorPickerOnChange={colorPickerOnChange}
                    />
                )
            }
        </React.Fragment>
    );
};

const mapStateToProps = state => {
    return {
        globalState: state.globalState
    };
};

const mapDispatchToProps = dispatch => ({
    setGlobalState: (state) => dispatch(setGlobalState(state)),
});

Themes.propTypes = {
    globalState: PropTypes.object,
    setGlobalState: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(Themes);