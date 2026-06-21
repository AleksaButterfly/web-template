/* eslint-disable no-console */
import ShareButton from './ShareButton';

const onManageDisableScrolling = (id, disableScrolling) =>
  console.log('manageDisableScrolling', id, disableScrolling);

const commonProps = {
  url: 'https://marketplace.example.com/l/cool-vintage-bike/12345',
  title: 'Cool vintage bike',
  onManageDisableScrolling,
};

export const Default = {
  component: ShareButton,
  props: {
    ...commonProps,
  },
};

export const WithAllTargets = {
  component: ShareButton,
  props: {
    ...commonProps,
    targets: ['whatsapp', 'x', 'facebook', 'linkedin', 'pinterest', 'email'],
    media: 'https://marketplace.example.com/images/cool-vintage-bike.jpg',
  },
};

export const CopyOnly = {
  component: ShareButton,
  props: {
    ...commonProps,
    targets: [],
  },
};
