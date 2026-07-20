import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useIntl, FormattedMessage } from 'react-intl';

import { H2, Modal, SecondaryButton, SecondaryButtonInline } from '../../components';
import {
  SHARE_TARGETS,
  canNativeShare,
  copyToClipboard,
  nativeShare,
  openShareTarget,
} from '../../util/share';

import {
  checkIcon,
  emailIcon,
  facebookIcon,
  linkIcon,
  linkedinIcon,
  pinterestIcon,
  shareIcon,
  whatsappIcon,
  xIcon,
} from './icons';
import css from './ShareButton.module.css';

const DEFAULT_TARGETS = ['whatsapp', 'x', 'facebook', 'email'];
const DEFAULT_MODAL_ID = 'ShareButton.shareModal';
const COPIED_RESET_MS = 2000;

// Maps a SHARE_TARGETS id to its icon renderer (see ./icons). Every icon takes `{ ariaLabel,
// className }` and renders a width/height-less <svg>, so the wrapper's CSS controls the size.
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
 * Built from the template's own components — `SecondaryButtonInline` (trigger), `H2`, `Modal`, and
 * `SecondaryButton` (copy / native share) — so it matches the rest of the UI. The host page must
 * provide `onManageDisableScrolling` (dispatched from the `manageDisableScrolling` UI duck action).
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
 * @param {string} [props.rootClassName] - Overrides the trigger's root class (SecondaryButtonInline root).
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

  return (
    <>
      <SecondaryButtonInline
        type="button"
        rootClassName={rootClassName}
        className={classNames(css.trigger, className)}
        onClick={() => setIsModalOpen(true)}
      >
        <span className={css.buttonIcon}>{shareIcon({ ariaLabel: '', className: css.icon })}</span>
        <FormattedMessage id="ShareButton.label" />
      </SecondaryButtonInline>

      <Modal
        id={modalId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onManageDisableScrolling={onManageDisableScrolling}
        usePortal
      >
        <div className={css.modalContent}>
          <H2 className={css.modalTitle}>
            <FormattedMessage id="ShareButton.modalTitle" />
          </H2>

          <div className={css.copyRow}>
            <input
              type="text"
              className={css.urlInput}
              value={url}
              readOnly
              aria-label={intl.formatMessage({ id: 'ShareButton.linkLabel' })}
              onFocus={e => e.target.select()}
            />
            <SecondaryButton type="button" onClick={handleCopy}>
              <span className={css.buttonIcon}>
                {copied
                  ? checkIcon({ ariaLabel: '', className: css.icon })
                  : linkIcon({ ariaLabel: '', className: css.icon })}
              </span>
              {copied ? (
                <FormattedMessage id="ShareButton.copied" />
              ) : (
                <FormattedMessage id="ShareButton.copyLink" />
              )}
            </SecondaryButton>
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
                  <span className={css.targetIcon}>
                    {renderIcon ? renderIcon({ ariaLabel: '', className: css.icon }) : null}
                  </span>
                  <span className={css.targetName}>{networkName}</span>
                </button>
              );
            })}
          </div>

          {nativeShareAvailable ? (
            <SecondaryButton type="button" onClick={handleNativeShare}>
              <span className={css.buttonIcon}>
                {shareIcon({ ariaLabel: '', className: css.icon })}
              </span>
              <FormattedMessage id="ShareButton.moreOptions" />
            </SecondaryButton>
          ) : null}
        </div>
      </Modal>
    </>
  );
};

export default ShareButton;
