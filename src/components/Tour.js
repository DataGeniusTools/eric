/**
 * Tour component for ERic application
 */

import React from 'react';
import { Tour } from 'antd';
import automaticlayout from '../automaticlayout.png';
import fitview from '../fitview.png';

/**
 * Tour component for ERic application
 * @param {Object} props - Component props
 * @param {boolean} props.isTourOpen - Whether the tour is open
 * @param {Function} props.onTourClose - Function called when tour is closed
 * @param {Object} props.tourRefs - Object containing tour refs
 */
const TourComponent = ({
  isTourOpen,
  onTourClose,
  tourRefs
}) => {
  const tourSteps = [
    {
      title: 'Welcome',
      description: <>
        Welcome to ERic, an interactive Entity Relationship creator!<br /><br />
        This tour will help you to understand the main elements of ERic.
      </>,
      target: null
    },
    {
      title: 'ER definition language',
      description: <>
        Enter here your entity relationship definition in the ERic language.<br /><br />
        Try it copy the example below into your clipboard and paste it into the code definition window.<br /><br />
        Entity Customer {'{'}<br />
        &nbsp;&nbsp;id int *<br />
        &nbsp;&nbsp;fname string<br />
        &nbsp;&nbsp;lname string<br />
        &nbsp;&nbsp;addressId int<br />
        {'}'}<br />
        Entity Order {'{'}<br />
        &nbsp;&nbsp;id int *<br />
        &nbsp;&nbsp;customerId int<br />
        &nbsp;&nbsp;orderDate date<br />
        {'}'}<br />
        Ref Order.customerId {'>'} Customer.id<br />
      </>,
      placement: 'right',
      target: () => tourRefs.monacoEditorTour.current
    },
    {
      title: 'ER diagram',
      description: <>
        Your ER diagram will be shown in this window.<br /><br />
        In the lower left corner there is a collection of buttons to adjust the diagram.<br /><br />
        Try the <b>automatic layout button</b> <img src={automaticlayout} alt="automatic layout" style={{ height: '12px' }} /> to arrange your diagram and the <b>fit view button</b> <img src={fitview} alt="fit view" style={{ height: '12px' }} /> afterwards to see the whole diagram<br /><br />
        Hover your mouse over each button to get a tooltip explaining its function.
      </>,
      placement: 'left',
      target: () => tourRefs.reactFlowTour.current
    },
    {
      title: 'Parse results',
      description: <>
        Parsing results will be displayed here.<br /><br />
        You should have a look to this area when your diagram is empty and check for any parsing errors displayed here.
      </>,
      placement: 'right',
      target: () => tourRefs.parseResultTour.current
    },
    {
      title: 'Tour',
      description: <>
        You can restart this tour with a click on this button.
      </>,
      placement: 'bottom',
      target: () => tourRefs.tourButtonTour.current
    },
    {
      title: 'Settings',
      description: <>
        You can enable or disable the automated tour start here.
      </>,
      placement: 'bottom',
      target: () => tourRefs.settingsButtonTour.current
    },
    {
      title: 'Github',
      description: <>
        Click on this icon to open the ERic Github page.<br /><br />
        You should get much more help how to use ERic, here a <a href="https://github.com/DataGeniusTools/eric/blob/master/doc/Userdoc.md" target="_blank" rel="noreferrer">direct link to the user manual.</a><br /><br />
        On the Github page a detailed description of ERic definition language grammar can be found <a href="https://github.com/DataGeniusTools/eric/blob/master/src/Ohm.js" target="_blank" rel="noreferrer">under this link</a> as well.
      </>,
      placement: 'bottom',
      target: () => tourRefs.gitLinkTour.current
    }
  ];

  return (
    <Tour
      open={isTourOpen}
      onClose={onTourClose}
      steps={tourSteps}
      indicatorsRender={(current, total) => (
        <span>
          {current + 1} / {total}
        </span>
      )}
    />
  );
};

export default TourComponent; 