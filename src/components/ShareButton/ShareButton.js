import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useIntl, FormattedMessage } from 'react-intl';

import { Modal } from '../../components';
import {
  facebookIcon,
  linkedinIcon,
  pinterestIcon,
  xIcon,
} from '../../containers/PageBuilder/Primitives/Link/Icons';
import {
  SHARE_TARGETS,
  canNativeShare,
  copyToClipboard,
  nativeShare,
  openShareTarget,
} from '../../util/share';

import { checkIcon, emailIcon, linkIcon, shareIcon, whatsappIcon } from './icons';
import css from './ShareButton.module.css';

const DEFAULT_TARGETS = ['whatsapp', 'x', 'facebook', 'email'];
const DEFAULT_MODAL_ID = 'ShareButton.shareModal';
const COPIED_RESET_MS = 2000;

// Maps a SHARE_TARGETS id to its icon renderer. Social icons are reused from the template's
// PageBuilder set; the rest are local (see ./icons).
const TARGET_ICONS = {
  whatsapp: whatsappIcon,
  x: xIcon,
  facebook: facebookIcon,
  linkedin: linkedinIcon,
  pinterest: pinterestIcon,
  email: emailIcon,
};

// Brand names are not translated; only the surrounding copy ("Share via {network}") is.
const TARGET_NAMES = {
  whatsapp: 'WhatsApp',
  x: 'X',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  pinterest: 'Pinterest',
  email: 'Email',
};

/**
 * A reusable share control: a trigger button that opens a modal with a copy-link field and a set of
 * external share channels (WhatsApp, X, Facebook, Email, …). On devices that support the native Web
 * Share API, the modal also offers the OS share sheet.
 *
 * The component is presentation-only: pass in a ready-to-share (preferably canonical, absolute)
 * `url` and it handles the rest. It reuses the template's `Modal`, so the host page must provide
 * `onManageDisableScrolling` (dispatched from the `manageDisableScrolling` UI duck action).
 *
 * @component
 * @param {Object} props
 * @param {string} props.url - The absolute URL to share (required). Renders nothing if missing.
 * @param {string} [props.title] - Title of the shared resource, used in default share text/subject.
 * @param {string} [props.text] - Overrides the default share message used by targets and native share.
 * @param {string} [props.media] - Absolute image URL, used by image-based targets (Pinterest).
 * @param {Array<string>} [props.targets] - Ordered SHARE_TARGETS ids to show. Defaults to WhatsApp, X, Facebook, Email.
 * @param {Function} props.onManageDisableScrolling - Forwarded to Modal; `(id, disableScrolling) => void`.
 * @param {string} [props.modalId] - Unique Modal id; set this when multiple ShareButtons share a page.
 * @param {string} [props.rootClassName] - Overrides the root/trigger CSS class.
 * @param {string} [props.className] - Additional classes appended to the trigger.
 * @returns {JSX.Element|null}
 */
const ShareButton = props => {
  const {
    url,
    title,
    text,
    media,
    targets = DEFAULT_TARGETS,
    onManageDisableScrolling,
    modalId = DEFAULT_MODAL_ID,
    rootClassName,
    className,
  } = props;

  const intl = useIntl();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  // Guards against an SSR/client hydration mismatch: the native share button depends on browser
  // APIs that don't exist on the server, so it only appears after mount.
  const [mounted, setMounted] = useState(false);
  const copyResetTimeout = useRef(null);

  useEffect(() => {
    setMounted(true);
    return () => clearTimeout(copyResetTimeout.current);
  }, []);

  if (!url) {
    return null;
  }

  const shareText =
    text || intl.formatMessage({ id: 'ShareButton.shareText' }, { title: title || '' });
  const emailSubject = intl.formatMessage(
    { id: 'ShareButton.emailSubject' },
    { title: title || '' }
  );

  // Params forwarded to SHARE_TARGETS.buildUrl (already-translated copy lives here).
  const shareParams = { url, title, text: shareText, subject: emailSubject, media };
  const nativeShareData = { title, text: shareText, url };
  const nativeShareAvailable = mounted && canNativeShare(nativeShareData);

  const visibleTargets = SHARE_TARGETS.filter(target => targets.includes(target.id));

  const handleCopy = async () => {
    const succeeded = await copyToClipboard(url);
    if (succeeded) {
      setCopied(true);
      clearTimeout(copyResetTimeout.current);
      copyResetTimeout.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
    }
  };

  const handleNativeShare = () => {
    // A rejected promise here means the user dismissed the share sheet — treat it as a no-op.
    nativeShare(nativeShareData).catch(() => {});
  };

  const classes = classNames(rootClassName || css.root, className);

  return (
    <>
      <button
        type="button"
        className={classes}
        onClick={() => setIsModalOpen(true)}
        aria-label={intl.formatMessage({ id: 'ShareButton.label' })}
      >
        {shareIcon({ ariaLabel: '' })}
        <span className={css.triggerLabel}>
          <FormattedMessage id="ShareButton.label" />
        </span>
      </button>

      <Modal
        id={modalId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onManageDisableScrolling={onManageDisableScrolling}
        usePortal
        containerClassName={css.modalContainer}
      >
        <div className={css.modalContent}>
          <h2 className={css.modalTitle}>
            <FormattedMessage id="ShareButton.modalTitle" />
          </h2>

          <div className={css.copyRow}>
            <input
              type="text"
              className={css.urlInput}
              value={url}
              readOnly
              aria-label={intl.formatMessage({ id: 'ShareButton.linkLabel' })}
              onFocus={e => e.target.select()}
            />
            <button type="button" className={css.copyButton} onClick={handleCopy}>
              {copied ? checkIcon({ ariaLabel: '' }) : linkIcon({ ariaLabel: '' })}
              <span>
                {copied ? (
                  <FormattedMessage id="ShareButton.copied" />
                ) : (
                  <FormattedMessage id="ShareButton.copyLink" />
                )}
              </span>
            </button>
          </div>

          <p className={css.shareOnLabel}>
            <FormattedMessage id="ShareButton.shareOn" />
          </p>
          <div className={css.targets}>
            {visibleTargets.map(target => {
              const renderIcon = TARGET_ICONS[target.id];
              const networkName = TARGET_NAMES[target.id];
              const label = intl.formatMessage(
                { id: 'ShareButton.shareVia' },
                { network: networkName }
              );
              return (
                <button
                  key={target.id}
                  type="button"
                  className={css.targetButton}
                  onClick={() => openShareTarget(target, shareParams)}
                  title={label}
                  aria-label={label}
                >
                  {renderIcon ? renderIcon({ ariaLabel: '' }) : null}
                  <span className={css.targetName}>{networkName}</span>
                </button>
              );
            })}
          </div>

          {nativeShareAvailable ? (
            <button type="button" className={css.nativeShareButton} onClick={handleNativeShare}>
              {shareIcon({ ariaLabel: '' })}
              <span>
                <FormattedMessage id="ShareButton.moreOptions" />
              </span>
            </button>
          ) : null}
        </div>
      </Modal>
    </>
  );
};

export default ShareButton;
