interface PageJsonLdProps {
  pageName: string
  pageUrl: string
  breadcrumbs: Array<{ name: string; url: string }>
}

export default function PageJsonLd({ pageName, pageUrl, breadcrumbs }: PageJsonLdProps) {
  const breadcrumbList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  }

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: pageName,
    url: pageUrl,
    isPartOf: { '@type': 'WebSite', '@id': 'https://raos.uz/#website' },
    publisher: { '@type': 'Organization', '@id': 'https://raos.uz/#organization' },
    breadcrumb: breadcrumbList,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }}
      />
    </>
  )
}
