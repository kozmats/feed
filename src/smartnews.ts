import * as convert from "xml-js";
import { generator } from "./config";
import { Feed } from "./feed";
import { Item, Author } from "./typings";

export default (ins: Feed) => {
  const { options } = ins;
  let isContent = false;

  const base: any = {
    _declaration: { _attributes: { version: "1.0", encoding: "utf-8" } },
    rss: {
      _attributes: { version: "2.0" },
      channel: {
        title: { _text: options.title },
        link: { _text: options.link },
        description: { _text: options.description },
        lastBuildDate: { _text: options.updated ? options.updated.toUTCString() : new Date().toUTCString() },
        docs: { _text: options.docs ? options.docs : "https://validator.w3.org/feed/docs/rss2.html" },
        generator: { _text: options.generator || generator },
        'snf:logo': { url: options.sfLogo }
      }
    }
  };

  /**
   * Channel language
   * https://validator.w3.org/feed/docs/rss2.html#ltimagegtSubelementOfLtchannelgt
   */
  if (options.language) {
    base.rss.channel.language = { _text: options.language };
  }

  /**
   * Channel Image
   * https://validator.w3.org/feed/docs/rss2.html#ltimagegtSubelementOfLtchannelgt
   */
  if (options.image) {
    base.rss.channel.image = {
      title: { _text: options.title },
      url: { _text: options.image },
      link: { _text: options.link }
    };
  }

  /**
   * Channel Copyright
   * https://validator.w3.org/feed/docs/rss2.html#optionalChannelElements
   */
  if (options.copyright) {
    base.rss.channel.copyright = { _text: options.copyright };
  }

  /**
   * Channel Categories
   * https://validator.w3.org/feed/docs/rss2.html#comments
   */
  ins.categories.map(category => {
    if (!base.rss.channel.category) {
      base.rss.channel.category = [];
    }
    base.rss.channel.category.push({ _text: category });
  });

  /**
   * Channel Categories
   * https://validator.w3.org/feed/docs/rss2.html#hrelementsOfLtitemgt
   */
  base.rss.channel.item = [];

  ins.items.map((entry: Item) => {
    let item: any = {};

    if (entry.title) {
      item.title = { _cdata: entry.title };
    }

    if (entry.link) {
      item.link = { _text: entry.link };
    }

    if (entry.guid) {
      item.guid = { _text: entry.guid };
    } else if (entry.link) {
      item.guid = { _text: entry.link };
    }

    if (entry.date) {
      item.pubDate = { _text: entry.date.toUTCString() };
    }

    if (entry.description) {
      item.description = { _cdata: entry.description };
    }

    if (entry.content) {
      isContent = true;
      item["content:encoded"] = { _cdata: entry.content };
    }

    if (entry.creator) {
      item["dc:creator"] = { _text: entry.creator }
    }

    if (entry.image) {
      item["media:thumbnail"] = { _attributes: { url: entry.image } }
    }

    if (entry.status != null) {
      item["media:status"] = { _text: entry.status ? "active" : "deleted" }
    } else {
      item["media:status"] = { _text: "active" }
    }

    if (entry.analytics) {
      item["snf:analytics"] = { _cdata: entry.analytics }
    }

    base.rss.channel.item.push(item);
  });

  if (isContent) {
    base.rss._attributes["xmlns:content"] = "http://purl.org/rss/1.0/modules/content/";
  }

  base.rss._attributes["xmlns:dc"] = "http://purl.org/dc/elements/1.1/";
  base.rss._attributes["xmlns:media"] = "http://search.yahoo.com/mrss/";
  base.rss._attributes["xmlns:snf"] = "http://www.smartnews.be/snf";

  return convert.js2xml(base, { compact: true, ignoreComment: true, spaces: 4 });
};
