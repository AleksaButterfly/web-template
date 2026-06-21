import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';

import ShareButton from './ShareButton';

const { screen, fireEvent } = testingLibrary;
const noop = () => null;

const props = {
  url: 'https://marketplace.example.com/l/cool-bike/12345',
  title: 'Cool bike',
  onManageDisableScrolling: noop,
};

const openModal = () => fireEvent.click(screen.getByRole('button', { name: 'ShareButton.label' }));

describe('ShareButton', () => {
  // Modal renders into #portal-root when usePortal is set; jsdom needs that node to exist.
  let portalRoot;
  beforeEach(() => {
    portalRoot = document.createElement('div');
    portalRoot.setAttribute('id', 'portal-root');
    document.body.appendChild(portalRoot);
  });
  afterEach(() => {
    document.body.removeChild(portalRoot);
  });

  it('renders a share trigger', () => {
    render(<ShareButton {...props} />);
    expect(screen.getByText('ShareButton.label')).toBeInTheDocument();
  });

  it('opens a modal with the url and default share targets when clicked', () => {
    render(<ShareButton {...props} />);
    openModal();

    expect(screen.getByDisplayValue(props.url)).toBeInTheDocument();
    expect(screen.getByText('ShareButton.copyLink')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
    expect(screen.getByText('X')).toBeInTheDocument();
    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('copies the url and shows a confirmation', async () => {
    const writeText = jest.fn(() => Promise.resolve());
    navigator.clipboard = { writeText };

    render(<ShareButton {...props} />);
    openModal();
    fireEvent.click(screen.getByText('ShareButton.copyLink'));

    expect(writeText).toHaveBeenCalledWith(props.url);
    expect(await screen.findByText('ShareButton.copied')).toBeInTheDocument();

    delete navigator.clipboard;
  });

  it('respects a custom list of targets', () => {
    render(<ShareButton {...props} targets={['facebook']} />);
    openModal();
    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.queryByText('WhatsApp')).not.toBeInTheDocument();
  });

  it('offers the native share sheet when the Web Share API is available', async () => {
    navigator.share = jest.fn(() => Promise.resolve());

    render(<ShareButton {...props} />);
    openModal();
    expect(await screen.findByText('ShareButton.moreOptions')).toBeInTheDocument();

    delete navigator.share;
  });

  it('renders nothing without a url', () => {
    const { container } = render(<ShareButton {...props} url={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });
});
