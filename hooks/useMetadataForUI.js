export default function useMetadataForUI() {
  const getMetadataForUI = async (library, id) => {
    try {
      const GB_KEY = process.env.NEXT_PUBLIC_GB_KEY;
      const TROVE_KEY = process.env.NEXT_PUBLIC_trove_key;
      const permission = `CCO No Rights Reserved https://creativecommons.org/publicdomain/mark/1.0/`;
      switch (library) {
        case "gb":
          const gbRes = await fetch(
            `https://www.googleapis.com/books/v1/volumes/${id}?key=${GB_KEY}`
          );
          const gbMetadata = await gbRes.json();
          let {
            title: gb_title,
            subtitle: gb_subtitle,
            authors: gb_authors,
            publisher: gb_publisher,
            publishedDate: gb_publishedDate,
            language: gb_language,
            pageCount: gb_pageCount,
            infoLink: gb_infoLink,
          } = gbMetadata.volumeInfo;

          const gb_authorsFormatted = gb_authors
            ? gb_authors.join().trim()
            : "";
          const gb_commonsMetadata = `{{Book
|Author=${gb_authorsFormatted}
|Title=${gb_title}
|Description=${gb_subtitle}
|Language=${gb_language}
|Publication Date=${gb_publishedDate}
|Source=${gb_infoLink}
|Publisher=${gb_publisher}
|Permission=${permission}
|Other_fields_1={{Information field|name=Rights|value=${gbMetadata.accessInfo.accessViewStatus}|name=Pages|value=${gb_pageCount}}}
}}
{{cc-zero}}
[[Category:bub.wikimedia]]
`;
          return gb_commonsMetadata.replace(/&/g, "_");
        case "trove":
          const troveRes = await fetch(
            `https://api.trove.nla.gov.au/v2/newspaper/${id}?key=${TROVE_KEY}&encoding=json&reclevel=full`
          );
          const troveJson = await troveRes.json();
          const troveMetadata = troveJson.article;
          let {
            title: trove_title,
            date: trove_date,
            troveUrl: trove_url,
            page: trove_page,
            identifier: trove_identifier,
            heading: trove_heading,
            category: trove_category,
          } = troveMetadata;

          const trove_commonsMetadata = `{{Book
|Title=${trove_heading}
|Description=${trove_title.value}
|Publication Date=${trove_date}
|Source=${trove_url}
|Permission=${permission}
|Other_fields_1={{Information field|name=Identifier|value=${trove_identifier}|name=Pages|value=${trove_page}|name=Category|value=${trove_category}}}
}}
{{cc-zero}}
[[Category:bub.wikimedia]]
`;
          return trove_commonsMetadata;
      }
    } catch (error) {
      return error;
    }
  };

  return { getMetadataForUI };
}
