import React from 'react';

/**
 * Share-related icons.
 *
 * Every icon is a function taking `{ ariaLabel, className }` and returning an `<svg>` that carries
 * the given class and NO intrinsic `width`/`height` — sizing is controlled entirely by CSS on the
 * icon's wrapper, so the same glyph can render at different sizes without editing the SVG. Each svg
 * declares a `viewBox` and `fill="currentColor"` so it scales cleanly and inherits text color.
 *
 * The social glyphs mirror the paths used by the template's PageBuilder social icons
 * (src/containers/PageBuilder/Primitives/Link/Icons) so they look identical; they live here so they
 * can accept a className like the rest.
 */

const svgProps = (ariaLabel, className, viewBox) => ({
  className,
  viewBox,
  fill: 'currentColor',
  xmlns: 'http://www.w3.org/2000/svg',
  role: 'img',
  'aria-label': ariaLabel,
});

export const shareIcon = ({ ariaLabel = 'Share', className }) => (
  <svg {...svgProps(ariaLabel, className, '0 0 24 24')}>
    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
  </svg>
);

export const linkIcon = ({ ariaLabel = 'Copy link', className }) => (
  <svg {...svgProps(ariaLabel, className, '0 0 24 24')}>
    <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
  </svg>
);

export const checkIcon = ({ ariaLabel = 'Copied', className }) => (
  <svg {...svgProps(ariaLabel, className, '0 0 24 24')}>
    <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

export const whatsappIcon = ({ ariaLabel = 'WhatsApp', className }) => (
  <svg {...svgProps(ariaLabel, className, '0 0 24 24')}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

export const emailIcon = ({ ariaLabel = 'Email', className }) => (
  <svg {...svgProps(ariaLabel, className, '0 0 24 24')}>
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5z" />
  </svg>
);

export const facebookIcon = ({ ariaLabel = 'Facebook', className }) => (
  <svg {...svgProps(ariaLabel, className, '0 0 10 18')}>
    <path d="m8.643 9.688.472-3.077H6.163V4.614c0-.841.413-1.662 1.735-1.662H9.24V.332S8.022.126 6.858.126c-2.431 0-4.02 1.474-4.02 4.141v2.345H.134v3.077h2.702v7.437h3.326V9.687h2.48Z" />
  </svg>
);

export const xIcon = ({ ariaLabel = 'X', className }) => (
  <svg {...svgProps(ariaLabel, className, '0 0 16.61 14.999')}>
    <path d="M12.641 0h2.453L9.709 6.131 16 14.448h-4.937L7.198 9.394l-4.426 5.054H.32l5.705-6.557L0 0h5.06l3.492 4.617L12.642 0Zm-.858 13.009h1.36L4.344 1.386h-1.46l8.898 11.623Z" />
  </svg>
);

export const linkedinIcon = ({ ariaLabel = 'LinkedIn', className }) => (
  <svg {...svgProps(ariaLabel, className, '0 0 15 16')}>
    <path d="M13.938.188H1.184C.6.188.125.667.125 1.26v12.73c0 .591.475 1.072 1.06 1.072h12.753A1.07 1.07 0 0 0 15 13.99V1.26A1.07 1.07 0 0 0 13.938.187ZM4.62 12.938H2.416v-7.1h2.208v7.1h-.003Zm-1.102-8.07a1.279 1.279 0 1 1 .001-2.558 1.279 1.279 0 0 1 0 2.558Zm9.367 8.069H10.68V9.483c0-.823-.016-1.882-1.145-1.882-1.15 0-1.325.896-1.325 1.823v3.512H6.005V5.84H8.12v.97h.03c.296-.559 1.016-1.146 2.089-1.146 2.23 0 2.646 1.47 2.646 3.383v3.892Z" />
  </svg>
);

export const pinterestIcon = ({ ariaLabel = 'Pinterest', className }) => (
  <svg {...svgProps(ariaLabel, className, '0 0 17 17')}>
    <path d="M17 8.625a8.233 8.233 0 0 1-10.671 7.866c.335-.548.836-1.445 1.022-2.158l.512-1.96c.268.512 1.052.947 1.885.947 2.484 0 4.274-2.284 4.274-5.123 0-2.72-2.222-4.755-5.077-4.755-3.553 0-5.442 2.384-5.442 4.984 0 1.208.644 2.712 1.67 3.19.156.074.24.04.276-.109.026-.113.166-.674.229-.933a.247.247 0 0 0-.057-.236c-.335-.415-.607-1.172-.607-1.879 0-1.816 1.374-3.573 3.718-3.573 2.022 0 3.44 1.378 3.44 3.35 0 2.228-1.125 3.772-2.59 3.772-.806 0-1.414-.667-1.218-1.487.232-.98.68-2.035.68-2.743 0-.63-.338-1.158-1.042-1.158-.827 0-1.49.853-1.49 1.998 0 .73.245 1.222.245 1.222s-.814 3.447-.963 4.09c-.166.711-.1 1.714-.03 2.365a8.238 8.238 0 0 1-5.233-7.67A8.233 8.233 0 0 1 8.766.391 8.233 8.233 0 0 1 17 8.625Z" />
  </svg>
);
