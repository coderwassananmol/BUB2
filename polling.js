const { customFetch } = require("./utils/helper");
const config = require("./utils/bullconfig");
const { Mwn } = require("mwn");
const winston = require("winston");
const logger = winston.loggers.get("defaultLogger");

const IACountQueue = config.getNewQueue("ia-current-item");
const IACountQueueJobId = "currentIAItemIndex";
const IAAdvancedSearchURL = `https://archive.org/advancedsearch.php?q=bub.wikimedia&fl%5B%5D=identifier&sort%5B%5D&sort%5B%5D=addeddate+desc&rows=400&page=1&output=json&save=yes`;
const IAMetaDataBaseUrl = `https://archive.org/metadata`;

/**
 * The function `getIAMetadataAndDownloadUrl` makes a query to IA Advanced Search. The query returns an array of all items (identifiers) uploaded by IA Member `bub.wikimedia`.
 * Using the `count` variable stored on redis (via Bull) as its index it then selects and returns an item(`identifier`) from the array provided by the IA Advanced Search query.
 * Using the `identifier` it retrieves the corresponding metadata from IA.
 * @returns The function `getIAMetadataAndDownloadUrl` returns an object that contains the metadata of selected IA item and the download url of its pdf or zip file
 * @docs IA Advanced Search: https://archive.org/advancedsearch.php
 * IA Metadata API: https://archive.org/developers/md-read.html
 */
async function getIAMetadataAndDownloadUrl() {
  const getIACountQueue = await IACountQueue.getJob(`${IACountQueueJobId}`);
  const IACurrentIndex = getIACountQueue ? getIACountQueue.data.count : 0;
  const IAbub_wikimediaItems = await customFetch(
    `${IAAdvancedSearchURL}`,
    "GET"
  );
  if (IAbub_wikimediaItems === 404) {
    logger.log({
      level: "info",
      message: `Polling - getIAMetadataAndDownloadUrl: IA Advanced Search Failed`,
    });
    return 404;
  } else {
    const IACurrentIdentifier =
      IAbub_wikimediaItems.response.docs[`${IACurrentIndex}`].identifier;
    const IAMetaDataURL = `${IAMetaDataBaseUrl}/${IACurrentIdentifier}`;
    const IAItemMetaData = await customFetch(`${IAMetaDataURL}`, "GET");
    if (IAItemMetaData === 404) {
      logger.log({
        level: "error",
        message: `Polling - getIAMetadataAndDownloadUrl: Failed to fetch ${IAMetaDataURL} metadata`,
      });
      return 404;
    } else {
      const IAPdfFileName = IAItemMetaData.files.find((item) =>
        item.name.endsWith(".pdf")
      );
      const IATorrentFileName = IAItemMetaData.files.find((item) =>
        item.name.endsWith(".zip")
      );
      const IADownloadFileName = IAPdfFileName
        ? IAPdfFileName
        : IATorrentFileName;
      const IADownloadURL_PDF = `https://archive.org/download/${IACurrentIdentifier}/${IADownloadFileName.name}`;
      return {
        IAItemMetaData,
        IADownloadURL_PDF,
      };
    }
  }
}

/**
 * The Wikimedia Commons API allows uploads directly from a URL.
 * The function `uploadToCommons` uploads the file and metadata returned from `getIAMetadataAndDownloadUrl` to Wikimedia Commons using the Mwn toolforge package. After successful upload, it updates the `count` variable stored on redis (via Bull)
 * @param IAItemMetaData  `IAItemMetaData` is an object that contains metadata information about an item from IA.
 * @param IADownloadURL_PDF  The `IADownloadURL_PDF` parameter is the URL of the PDF/ZIP file
 * that you want to upload to Wikimedia Commons. It should be a valid URL pointing to the location of the PDF/ZIP file.
 * @returns The function `uploadToCommons` returns the Commons filename of the uploaded file if the upload is successful.
 * @docs MWN TOOLFORGE PACKAGE - https://github.com/siddharthvp/mwn
 * Wikimedia Commons Upload File - https://www.mediawiki.org/wiki/API:Upload#JavaScript_2
 */
async function uploadToCommons(IAItemMetaData, IADownloadURL_PDF) {
  const bot = await Mwn.init({
    apiUrl: "https://commons.wikimedia.org/w/api.php",
    username: process.env.EMAIL_BOT_USERNAME,
    password: process.env.EMAIL_BOT_PASSWORD,
    userAgent: "bub2.toolforge ([[https://bub2.toolforge.org]])",
    defaultParams: {
      assert: "user",
    },
  });
  const getIACountQueue = await IACountQueue.getJob(`${IACountQueueJobId}`);
  const currentCount = getIACountQueue ? getIACountQueue.data.count : 0;

  async function upload_file() {
    try {
      const IAItemPermission = IAItemMetaData.metadata.licenseurl
        ? `CCO No Rights Reserved ${IAItemMetaData.metadata.licenseurl}`
        : "CC0 No Rights Reserved. Provided at no cost and free to use https://archive.org/about/terms.php";

      const res = await bot.uploadFromUrl(
        IADownloadURL_PDF,
        IAItemMetaData.metadata.title,
        `{{Book
|Author=${IAItemMetaData.metadata.author}
|Title=${IAItemMetaData.metadata.title}
|Description=${IAItemMetaData.metadata.description}
|Language=${IAItemMetaData.metadata.language}
|Publication Date=${IAItemMetaData.metadata.addeddate}
|Source=${IAItemMetaData.metadata["identifier-access"]}
|Publisher=${IAItemMetaData.metadata.publisher}
|Permission=${IAItemPermission}
|Other_fields_1={{Information field|name=Contributor|value=${IAItemMetaData.metadata.contributor}|name=Pages|value=${IAItemMetaData.metadata.pages}|name=Internet_Archive_Identifier|value=${IAItemMetaData.metadata.identifier}}}
}}
{{cc-zero}}
[[Category:bub.wikimedia]]
`
      );
      getIACountQueue?.remove();
      IACountQueue.add(
        {
          count: currentCount + 1,
        },
        {
          jobId: `${IACountQueueJobId}`,
        }
      );
      logger.log({
        level: "info",
        message: `Polling - uploadToCommons: Upload of ${IADownloadURL_PDF} to commons successful`,
      });
      return res.filename;
    } catch (error) {
      logger.log({
        level: "error",
        message: `Polling - uploadToCommons: Failed to upload ${IADownloadURL_PDF} to commons: ${error}`,
      });
      return 404;
    }
  }
  return await upload_file();
}

/**
 * The function `uploadToWikidata` uploads the metadata initially uploaded to Commons by `uploadToCommons` to Wikidata using the Mwn toolforge package
 * @param IAItemMetaData - IAItemMetaData is an object that contains metadata information about an item from IA.
 * @param commonsItemFilename - The `commonsItemFilename` parameter is the filename of the item on
 * Wikimedia Commons. It is used to set the label and file name properties in the Wikidata item.
 * @returns The function `uploadToWikidata` returns the wikidataId of the newly created wikidata entity
 * @docs MWN TOOLFORGE PACKAGE - https://github.com/siddharthvp/mwn
 * Wikidata API - https://www.mediawiki.org/wiki/Wikibase/API
 * Mapping for the labels/properties defined in `payload` - https://prop-explorer.toolforge.org/
 */
async function uploadToWikidata(IAItemMetaData, commonsItemFilename) {
  const bot = await Mwn.init({
    apiUrl: "https://www.wikidata.org/w/api.php",
    username: process.env.EMAIL_BOT_USERNAME,
    password: process.env.EMAIL_BOT_PASSWORD,
    userAgent: "bub2.toolforge ([[https://bub2.toolforge.org]])",
    defaultParams: {
      assert: "user",
    },
  });
  async function getCsrfToken() {
    try {
      const res = await bot.request({
        action: "query",
        meta: "tokens",
        format: "json",
      });

      return await createEntity(res.query.tokens.csrftoken);
    } catch (error) {
      logger.log({
        level: "error",
        message: `Polling - getCsrfToken: Failed to fetch CSRF token: ${error}`,
      });
    }
  }

  async function createEntity(csrf_token) {
    try {
      const payload = {
        labels: {
          en: {
            language: "en",
            value: commonsItemFilename,
          },
        },
        descriptions: {
          en: {
            language: "en",
            value: IAItemMetaData.title,
          },
        },
        claims: {
          file_name: [
            {
              mainsnak: {
                snaktype: "value",
                property: "P18",
                datavalue: {
                  value: commonsItemFilename,
                  type: "string",
                },
              },
              type: "statement",
              rank: "normal",
            },
          ],
          file_url: [
            {
              mainsnak: {
                snaktype: "value",
                property: "P4765",
                datavalue: {
                  value: `https://commons.wikimedia.org/wiki/File:${commonsItemFilename}`,
                  type: "string",
                },
              },
              type: "statement",
              rank: "normal",
            },
          ],
          commons_category: [
            {
              mainsnak: {
                snaktype: "value",
                property: "P373",
                datavalue: {
                  value: "Bub.wikimedia",
                  type: "string",
                },
              },
              type: "statement",
              rank: "normal",
            },
          ],
          inventory_number: IAItemMetaData.bookid
            ? [
                {
                  mainsnak: {
                    snaktype: "value",
                    property: "P217",
                    datavalue: {
                      value: IAItemMetaData.bookid,
                      type: "string",
                    },
                  },
                  type: "statement",
                  rank: "normal",
                },
              ]
            : undefined,
          collection: [
            {
              mainsnak: {
                snaktype: "value",
                property: "P195",
                datavalue: {
                  value: {
                    "entity-type": "item",
                    "numeric-id": 39162,
                    id: "Q39162", //wikidataID for 'opensource'
                  },
                  type: "wikibase-entityid",
                },
              },
              type: "statement",
              rank: "normal",
            },
          ],
          title: IAItemMetaData.title
            ? [
                {
                  mainsnak: {
                    snaktype: "value",
                    property: "P1476",
                    datavalue: {
                      value: {
                        text: IAItemMetaData.title,
                        language: "en",
                      },
                      type: "monolingualtext",
                    },
                  },
                  type: "statement",
                  rank: "normal",
                },
              ]
            : undefined,
          name: IAItemMetaData.title
            ? [
                {
                  mainsnak: {
                    snaktype: "value",
                    property: "P2561",
                    datavalue: {
                      value: {
                        text: IAItemMetaData.title,
                        language: "en",
                      },
                      type: "monolingualtext",
                    },
                  },
                  type: "statement",
                  rank: "normal",
                },
              ]
            : undefined,
          file_format: [
            {
              mainsnak: {
                snaktype: "value",
                property: "P2701",
                datavalue: {
                  value: {
                    "entity-type": "item",
                    "numeric-id": 42332,
                    id: "Q42332", // wikidataID for PDF
                  },
                  type: "wikibase-entityid",
                },
              },
              type: "statement",
              rank: "normal",
            },
          ],
          author_name: IAItemMetaData.author
            ? [
                {
                  mainsnak: {
                    snaktype: "value",
                    property: "P2093",
                    datavalue: {
                      value: IAItemMetaData.author,
                      type: "string",
                    },
                  },
                  type: "statement",
                  rank: "normal",
                },
              ]
            : undefined,
          URL: [
            {
              mainsnak: {
                snaktype: "value",
                property: "P2699",
                datavalue: {
                  value: `https://commons.wikimedia.org/wiki/File:${commonsItemFilename}`,
                  type: "string",
                },
              },
              type: "statement",
              rank: "normal",
            },
          ],
          copyright_status: [
            {
              mainsnak: {
                snaktype: "value",
                property: "P6216",
                datavalue: {
                  value: {
                    "entity-type": "item",
                    "numeric-id": 6938433,
                    id: "Q6938433", // wikidataID for CC0 license
                  },
                  type: "wikibase-entityid",
                },
              },
              type: "statement",
              rank: "normal",
            },
          ],
        },
      };

      const res = await bot.request({
        action: "wbeditentity",
        new: "item",
        summary: "bub2.toolforge.org: upload commons item to wikidata",
        tags: "wikimedia-commons-app",
        data: JSON.stringify(payload),
        token: csrf_token,
      });

      logger.log({
        level: "info",
        message: `Polling - uploadToWikidata: Upload of ${commonsItemFilename} metadata to wikidata successful`,
      });
      return res.entity.id;
    } catch (error) {
      logger.log({
        level: "error",
        message: `Polling - uploadToWikidata: Failed to upload  ${commonsItemFilename} to wikidata: ${error}`,
      });
      return 404;
    }
  }
  return await getCsrfToken();
}

/**
 * The function `updateCommons` updates the file on Wikimedia Commons
 * with its corresponding Wikidata ID in order to complete the sync
 * @param commonsItemFilename - The `commonsItemFilename` parameter is the name of the file on
 * Wikimedia Commons that you want to update. It should include the "File:" prefix.
 * @param wikidataId - The `wikidataId` parameter is the identifier of the item on Wikidata. It is used
 * to link the file on Wikimedia Commons to the corresponding item on Wikidata, which contains
 * structured data about the file.
 * @param IAItemMetaData - IAItemMetaData is an object that contains metadata information about an item
 * from the Internet Archive.
 */
async function updateCommons(commonsItemFilename, wikidataId, IAItemMetaData) {
  try {
    const bot = await Mwn.init({
      apiUrl: "https://commons.wikimedia.org/w/api.php",
      username: process.env.EMAIL_BOT_USERNAME,
      password: process.env.EMAIL_BOT_PASSWORD,
      userAgent: "bub2.toolforge ([[https://bub2.toolforge.org]])",
      defaultParams: {
        assert: "user",
      },
    });
    const IAItemPermission = IAItemMetaData.metadata.licenseurl
      ? `CCO No Rights Reserved ${IAItemMetaData.metadata.licenseurl}`
      : "CC0 No Rights Reserved. Provided at no cost and free to use https://archive.org/about/terms.php";

    await bot.edit(`File:${commonsItemFilename}`, () => {
      const text = `{{Book
|Author=${IAItemMetaData.metadata.author}
|Title=${IAItemMetaData.metadata.title}
|Description=${IAItemMetaData.metadata.description}
|Language=${IAItemMetaData.metadata.language}
|Publication Date=${IAItemMetaData.metadata.addeddate}
|Source=${IAItemMetaData.metadata["identifier-access"]}
|Publisher=${IAItemMetaData.metadata.publisher}
|Permission=${IAItemPermission}
|Wikidata=${wikidataId}
|Other_fields_1={{Information field|name=Contributor|value=${IAItemMetaData.metadata.contributor}|name=Pages|value=${IAItemMetaData.metadata.pages}|name=Internet_Archive_Identifier|value=${IAItemMetaData.metadata.identifier}}}
}}
{{cc-zero}}
[[Category:bub.wikimedia]]
`;
      return text;
    });
    logger.log({
      level: "info",
      message: `Polling - updateCommons: Successfully updated ${commonsItemFilename}`,
    });
  } catch (error) {
    logger.log({
      level: "error",
      message: `Polling - updateCommons: Failed to update ${commonsItemFilename}: ${error}`,
    });
  }
}

async function handlePolling() {
  const {
    IAItemMetaData,
    IADownloadURL_PDF,
  } = await getIAMetadataAndDownloadUrl();
  const commonsItemFilename = await uploadToCommons(
    IAItemMetaData,
    IADownloadURL_PDF
  );
  if (commonsItemFilename !== 404) {
    const wikidataId = await uploadToWikidata(
      IAItemMetaData.metadata,
      commonsItemFilename
    );
    if (wikidataId !== 404) {
      await updateCommons(commonsItemFilename, wikidataId, IAItemMetaData);
    }
  }
}

module.exports = handlePolling;
