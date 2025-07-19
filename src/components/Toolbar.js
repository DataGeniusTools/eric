/**
 * Toolbar component for ERic application
 */

import React from 'react';
import { Space, Button, Dropdown, Tooltip } from 'antd';
import { SettingOutlined, GithubOutlined } from '@ant-design/icons';

/**
 * Toolbar component with tour, settings, and github links
 * @param {Object} props - Component props
 * @param {Function} props.onTourClick - Function called when tour button is clicked
 * @param {React.Ref} props.tourButtonRef - Ref for tour button
 * @param {React.Ref} props.settingsButtonRef - Ref for settings button
 * @param {React.Ref} props.gitLinkRef - Ref for github link
 * @param {Array} props.settingsMenu - Settings menu items
 */
const Toolbar = ({
  onTourClick,
  tourButtonRef,
  settingsButtonRef,
  gitLinkRef,
  settingsMenu
}) => {
  return (
    <Space size="large" style={{ float: 'right' }}>
      <Button ref={tourButtonRef} type="primary" onClick={onTourClick}>
        Tour
      </Button>
      <Dropdown menu={settingsMenu} placement="bottomRight">
        <SettingOutlined 
          ref={settingsButtonRef} 
          style={{ 
            color: '#fff', 
            fontSize: '24px', 
            verticalAlign: 'middle', 
            cursor: 'pointer' 
          }} 
        />
      </Dropdown>
      <a href="https://github.com/DataGeniusTools/eric" target="_blank" rel="noopener noreferrer" ref={gitLinkRef}>
        <Tooltip title="go to Github repository">
          <GithubOutlined style={{ color: '#fff', fontSize: '24px', verticalAlign: 'middle' }} />
        </Tooltip>
      </a>
    </Space>
  );
};

export default Toolbar; 