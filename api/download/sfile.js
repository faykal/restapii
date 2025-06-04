const axios = require('axios');
const cheerio = require('cheerio');

const sfile = {
  createHeaders: function (referer) {
    return {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
      'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="137", "Google Chrome";v="137"',
      'dnt': '1',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
      'Referer': referer,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9'
    };
  },
  
  extractCookies: function (responseHeaders) {
    return responseHeaders["set-cookie"]?.map(cookie => cookie.split(";")[0]).join("; ") || "";
  },

  extractMetadata: function ($) {
    const metadata = {};
  
    $(".file-content").eq(0).each((_, element) => {
      const $element = $(element);
    
      metadata.file_name = $element.find("img").attr("alt");
      metadata.mimetype = $element.find(".list").eq(0).text().trim().split("-")[1].trim();
      metadata.upload_date = $element.find(".list").eq(2).text().trim().split(":")[1].trim();
      metadata.download_count = $element.find(".list").eq(3).text().trim().split(":")[1].trim();
      metadata.author_name = $element.find(".list").eq(1).find("a").text().trim();
    });
  
    return metadata;
  },

  makeRequest: async function (url, options) {
    try {
      return await axios.get(url, options);
    } catch (error) {
      if (error.response) {
        return error.response;
      }
      throw new Error(`Request gagal: ${error.message}`);
    }
  },

  download: async function (url, resultBuffer = false) {
    try {
      let headers = sfile.createHeaders(url);
      const initialResponse = await sfile.makeRequest(url, { headers });
    
      const cookies = sfile.extractCookies(initialResponse.headers);
      headers['Cookie'] = cookies;
    
      let $ = cheerio.load(initialResponse.data);
      const metadata = sfile.extractMetadata($);
    
      const downloadUrl = $("#download").attr("href");
      if (!downloadUrl) {
        throw new Error("Download URL tidak dapat ditemukan");
      }
    
      headers['Referer'] = downloadUrl;
      const processResponse = await sfile.makeRequest(downloadUrl, { headers });
    
      $ = cheerio.load(processResponse.data);
      const downloadButton = $("#download");
      if (!downloadButton.length) {
        throw new Error("Download beton ga ketemu");
      }
    
      const onClickAttr = downloadButton.attr("onclick");
      if (!onClickAttr) {
        throw new Error("kunci Download ga ketemu");
      }
    
      const key = onClickAttr.split("'+'")[1]?.split("';")[0];
      if (!key) {
        throw new Error("gagal mengekstrak kunci download");
      }
    
      const finalUrl = downloadButton.attr("href") + "&k=" + key;
      let download;
      if (resultBuffer) {
        const fileResponse = await sfile.makeRequest(finalUrl, {
          headers,
          responseType: "arraybuffer"
        });
        
        download = Buffer.from(fileResponse.data);
      } else {
        download = finalUrl;
      }
    
      return {
        metadata,
        download
      };
    } catch (error) {
      throw new Error(`Sfile gagal mendapatkan data: ${error.message}`);
    }
  }
};

/** 
 * Ini cara pakainya yah...
 * Kalo mau download URL nya, ubah saja resultBuffer ke false.
 * Kalo mau versi buffer nya, ubah saja resultBuffer ke true.
 **/

module.exports = {
    name: 'Sfile',
    desc: 'Download on Sfile',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, error: 'Url is required' });
        
        try {
            const results = await sfile.download(url, false);
            res.status(200).json({
                status: true,
                data: results
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}