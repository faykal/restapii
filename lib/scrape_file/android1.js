const axios = require('axios');
const cheerio = require('cheerio');

const baseUrl = 'https://an1.com';

class android1 {
    search = async function search(query) {
        const url = `https://an1.com/?story=${query}&do=search&subaction=search`;
        try {
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);
            const items = [];
            $('.item').each((index, element) => {
                const name = $(element).find('.name a span').text();
                const developer = $(element).find('.developer').text();
                const rating = $(element).find('.current-rating').css('width').replace('%', '');
                const imageUrl = $(element).find('.img img').attr('src');
                const link = $(element).find('.name a').attr('href');
                items.push({
                    name,
                    developer,
                    rating: parseFloat(rating) / 20,
                    imageUrl,
                    link
                });
            });
            return items;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    detail = async function detail(url) {    
        try {
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);
            const title = $('h1.title.xxlgf').text();
            const imageUrl = $('figure.img img').attr('src');
            const developer = $('.developer[itemprop="publisher"] span').text();
            const descriptionElement = $('.description #spoiler').html();
            const description = descriptionElement ? descriptionElement.replace(/<[^>]*>/g, '') : 'N/A';
            const version = $('span[itemprop="softwareVersion"]').text();
            const fileSize = $('span[itemprop="fileSize"]').text();
            const operatingSystem = $('span[itemprop="operatingSystem"]').text();
            const ratingElement = $('#ratig-layer-4959 .current-rating').css('width');
            const rating = ratingElement ? parseFloat(ratingElement.replace('%', '')) / 20 : 0;
            const ratingCount = $('#vote-num-id-4959').text();
            const downloadUrl = $('.download_line.green').attr('href');
            const screenshots = [];
            $('.app_screens_list a').each((index, element) => {
                const screenshotUrl = $(element).find('img').attr('src');
                screenshots.push(screenshotUrl);
            });
            const appInfo = {
                title: title || 'N/A',
                imageUrl: imageUrl || '',
                developer: developer || 'N/A',
                description: description,
                version: version || 'N/A',
                fileSize: fileSize || 'N/A',
                operatingSystem: operatingSystem || 'N/A',
                rating: rating,
                ratingCount: ratingCount || '0',
                downloadUrl: baseUrl + downloadUrl || '',
                screenshots: screenshots
            };
            return appInfo;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    download = async function download(urls) {
        try {
            const { data } = await axios.get(urls);
            const $ = cheerio.load(data);
            const title = $('div.description div.spoiler b').text() || 'N/A';
            const image = $('figure.img img').attr('src');
            const version = $('span[itemprop="softwareVersion"]').text().trim() || 'N/A';
            const url =  $('div.spec_addon a[role="button"]').attr('href');
            
            const { data: dl } = await axios.get('https://an1.com' + url);
            const $$ = cheerio.load(dl);
            const downloadUrl = $$('#pre_download').attr('href') || 'N/A'
            
            const downloadInfo = {
                title: title,
                imageUrl: image,
                version: version,
                downloadUrl
            };
            return downloadInfo;
        } catch (error) {
            throw new Error(error.message);
        }
    }
};

module.exports = new android1()