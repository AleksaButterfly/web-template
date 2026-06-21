import { SHARE_TARGETS, canNativeShare, copyToClipboard, openShareTarget } from './share';

const findTarget = id => SHARE_TARGETS.find(t => t.id === id);

const params = {
  url: 'https://example.com/l/cool-bike/1',
  title: 'Cool bike',
  text: 'Check out Cool bike',
  subject: 'Cool bike',
  media: 'https://example.com/cool-bike.jpg',
};

describe('SHARE_TARGETS buildUrl', () => {
  it('builds a WhatsApp url with text and url', () => {
    expect(findTarget('whatsapp').buildUrl(params)).toBe(
      `https://wa.me/?text=${encodeURIComponent(
        'Check out Cool bike https://example.com/l/cool-bike/1'
      )}`
    );
  });

  it('builds an X url with url and text', () => {
    expect(findTarget('x').buildUrl(params)).toBe(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        params.url
      )}&text=${encodeURIComponent(params.text)}`
    );
  });

  it('builds a Facebook sharer url', () => {
    expect(findTarget('facebook').buildUrl(params)).toBe(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(params.url)}`
    );
  });

  it('builds a Pinterest url with description and media', () => {
    expect(findTarget('pinterest').buildUrl(params)).toBe(
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
        params.url
      )}&description=${encodeURIComponent(params.text)}&media=${encodeURIComponent(params.media)}`
    );
  });

  it('builds a mailto url with subject and body', () => {
    expect(findTarget('email').buildUrl(params)).toBe(
      `mailto:?subject=${encodeURIComponent(params.subject)}&body=${encodeURIComponent(
        'Check out Cool bike\n\nhttps://example.com/l/cool-bike/1'
      )}`
    );
  });
});

describe('canNativeShare', () => {
  afterEach(() => {
    delete navigator.share;
    delete navigator.canShare;
  });

  it('returns false when navigator.share is unavailable', () => {
    expect(canNativeShare({ url: 'x' })).toBe(false);
  });

  it('returns true when navigator.share exists and canShare is absent', () => {
    navigator.share = jest.fn();
    expect(canNativeShare({ url: 'x' })).toBe(true);
  });

  it('defers to navigator.canShare when present', () => {
    navigator.share = jest.fn();
    navigator.canShare = jest.fn(() => false);
    expect(canNativeShare({ url: 'x' })).toBe(false);
    expect(navigator.canShare).toHaveBeenCalled();
  });
});

describe('copyToClipboard', () => {
  afterEach(() => {
    delete navigator.clipboard;
    jest.restoreAllMocks();
  });

  it('uses the async clipboard API when available', async () => {
    const writeText = jest.fn(() => Promise.resolve());
    navigator.clipboard = { writeText };
    const ok = await copyToClipboard('hello');
    expect(writeText).toHaveBeenCalledWith('hello');
    expect(ok).toBe(true);
  });

  it('falls back to execCommand when the clipboard API throws', async () => {
    navigator.clipboard = { writeText: jest.fn(() => Promise.reject(new Error('denied'))) };
    document.execCommand = jest.fn(() => true);
    const ok = await copyToClipboard('hello');
    expect(document.execCommand).toHaveBeenCalledWith('copy');
    expect(ok).toBe(true);
  });
});

describe('openShareTarget', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('opens non-mailto targets in a new, isolated tab', () => {
    const open = jest.spyOn(window, 'open').mockImplementation(() => null);
    openShareTarget(findTarget('facebook'), params);
    expect(open).toHaveBeenCalledWith(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(params.url)}`,
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('does not open a new tab for mailto targets (navigates the current window instead)', () => {
    // window.location is intentionally left untouched: jsdom locks it, and the navigation itself
    // is a trivial assignment. We assert the branch by confirming no new tab is opened.
    const open = jest.spyOn(window, 'open').mockImplementation(() => null);
    openShareTarget(findTarget('email'), params);
    expect(open).not.toHaveBeenCalled();
  });
});
