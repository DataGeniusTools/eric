/**
 * Custom hook for managing tour functionality
 */

import { useState, useEffect, useRef } from 'react';
import { Modal } from 'antd';
import { saveTourPreference, loadTourPreference } from '../services/storage';

/**
 * Custom hook for managing tour state and functionality
 * @returns {Object} Tour state and functions
 */
export const useTour = () => {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isTourDisabled, setIsTourDisabled] = useState(false); // Start with false, will be updated in useEffect
  const initialRender = useRef(true);

  // Tour refs
  const mainWindowTour = useRef(null);
  const monacoEditorTour = useRef(null);
  const reactFlowTour = useRef(null);
  const parseResultTour = useRef(null);
  const gitLinkTour = useRef(null);
  const tourButtonTour = useRef(null);
  const settingsButtonTour = useRef(null);

  // Load tour preference and auto-start tour on first render
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      const savedTourPreference = loadTourPreference();
      setIsTourDisabled(savedTourPreference);
      if (savedTourPreference === false) {
        setIsTourOpen(true);
      }
    }
  }, []);

  /**
   * Opens the tour
   */
  const openTour = () => {
    setIsTourOpen(true);
  };

  /**
   * Closes the tour and optionally asks to disable it
   */
  const closeTour = () => {
    setIsTourOpen(false);
    if (!isTourDisabled) {
      Modal.confirm({
        title: 'Tour',
        content: <p>Disable Tour on Start?</p>,
        okText: 'Disable',
        cancelText: 'Keep',
        onOk: () => {
          const disableTour = !isTourDisabled;
          setIsTourDisabled(disableTour);
          saveTourPreference(disableTour);
        },
      });
    }
  };

  /**
   * Toggles tour disabled state
   */
  const toggleTourDisabled = () => {
    const newState = !isTourDisabled;
    setIsTourDisabled(newState);
    saveTourPreference(newState);
  };

  return {
    // State
    isTourOpen,
    isTourDisabled,
    
    // Refs
    mainWindowTour,
    monacoEditorTour,
    reactFlowTour,
    parseResultTour,
    gitLinkTour,
    tourButtonTour,
    settingsButtonTour,
    
    // Functions
    openTour,
    closeTour,
    toggleTourDisabled
  };
}; 