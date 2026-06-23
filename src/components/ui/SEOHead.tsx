import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SITE_NAME = 'XOICE Photography';
const DEFAULT_DESCRIPTION = '捕捉城市与星空的交汇点。专业摄影作品展示、摄影研学活动、视频教学内容。';
const DEFAULT_IMAGE = '/og-default.jpg';
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://xoice.com';

export default function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | 摄影作品集`;
  const absoluteUrl = url ? `${SITE_URL}${url}` : undefined;
  const absoluteImage = image && !image.startsWith('http') ? `${SITE_URL}${image}` : image;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {absoluteImage && <meta property="og:image" content={absoluteImage} />}
      {absoluteUrl && <meta property="og:url" content={absoluteUrl} />}
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {absoluteImage && <meta name="twitter:image" content={absoluteImage} />}
    </Helmet>
  );
}
