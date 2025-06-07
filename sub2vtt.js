const { convert } = require('subtitle-converter');
const unrar = require("node-unrar-js");
const AdmZip = require('adm-zip');
const axios = require('axios');

const iconv = require('iconv-jschardet');
const ENCODING_MAP = require('./encodings');
iconv.skipDecodeWarning(true)
iconv.disableCodecDataWarn(true)

class sub2vtt {
    constructor(url, opts = {}) {
        let { proxy, episode, type, lang } = opts;
        this.url = url;
        this.proxy = proxy || {};
        this.lang = lang || null;
        this.data = null;
        this.size = null;
        this.error = null;
        this.type = type || null;
        this.client = null;
        this.episode = episode || null;
    }

    async GetData() {
        let res = await this.request({
            method: 'get',
            url: this.url,
            responseType: 'arraybuffer',
            Accept: this.type,
        });
        //console.log("res",res)
        if (res?.data) {
            this.type = this.type || res.headers["content-type"].split(';')[0];
            this.data = res.data;
            this.size = Number(res.headers["content-length"]);
        }
    }

    GiveData(data) {
        this.data = data;
    }
    DatafromHeaders(headers) {
        this.type = this.type || headers["content-type"].split(';')[0];
        this.size = Number(headers["content-length"]);
    }

    async getSubtitle() {
        try {
            // checking the link

            let file
            console.log("this.type", this.type)
            console.log("this.data", this.data)

            if (!this.type) await this.CheckUrl()

            if (!this.type || !this.data) await this.GetData();
            if (!this.type || !this.data) throw "error getting sub"

            if (this.size?.length > 10000000) throw "file too big"
            //get the file
            if (this.supported.arc.includes(this.type)) {
                file = await this.extract()
                if (!file) throw "error extracting archive"
            }
            if (this.supported.subs.includes(this.type)) {
                file = await this.GetSub()
            } else {
                if (file) file = await this.GetSub(file)
                else file = await this.GetSub()
            }
            return file
        } catch (e) {
            console.error(e);
        }
    }

    async CheckUrl() {
        try {

            let res = await this.request(
                {
                    method: "head",
                    url: this.url,
                })

            if (!res || !res.status == "200" || !res.headers) throw "error getting headers"
            let headers = res.headers;
            if (!headers) throw "the url provided couldn't be reached";

            this.DatafromHeaders(headers);

            if (headers["transfer-encoding"] && headers["transfer-encoding"] == 'chunked') {
                console.log("the file is buffering")
            }
            if (this.type == 'arraybuffer/json') console.log("the file is an array buffer")
            if (this.supported.arc.includes(this.type)) {
                console.log("the requested file is an archive", this.type)
            } else if (this.supported.subs.includes(this.type)) {
                console.log("the requested file is a subtitle", this.type)
            } else console.log("unsupported file format", this.type)

        } catch (err) {
            console.error(err);
            return { res: "error", reason: err };
        }
    }

    async extract() {
        try {

            if (!this.data) throw "error requesting file"
            let res = this.data;
            const rar = this.supported.arcs.rar
            const zip = this.supported.arcs.zip
            if (rar.includes(this.type)) {
                return await this.unrar(res);
            } else if (zip.includes(this.type)) {
                return await this.unzip(res);
            }
            return
        } catch (err) {
            console.error(err);
            this.error = err;
        }

    }



    async GetSub(inputData) {
        let subtitleContent;
        try {
            let res;

            if (inputData) {
                res = inputData
            }
            else if (this.data) res = this.data
            else {
                res = await this.request({
                    method: 'get',
                    url: this.url,
                    responseType: 'arraybuffer'
                });
                if (res?.data) res = res.data
                if (!res) throw "error requesting file"
            }
            let detected = iconv.detect(res);
            let finalEncoding = detected.encoding;
            console.log(`Detected encoding: ${finalEncoding} with ${detected.confidence} confidence.`);

            // If detection is not confident or not UTF-8, use our language map as a better fallback.
            if (detected.confidence < 0.9 || (finalEncoding.toLowerCase() !== 'utf-8' && finalEncoding.toLowerCase() !== 'utf-16le')) {
                const mappedEncoding = ENCODING_MAP[this.lang];
                if (mappedEncoding) {
                    console.log(`Language is '${this.lang}', falling back to mapped encoding: ${mappedEncoding}`);
                    finalEncoding = mappedEncoding;
                } else {
                    console.log(`Language '${this.lang}' not in map, using original detection: ${finalEncoding}`);
                }
            }
            
            subtitleContent = iconv.decode(res, finalEncoding);

            // Defensive check: ensure subtitleContent is a string before manipulation
            if (typeof subtitleContent !== 'string') {
                subtitleContent = subtitleContent.toString();
            }

            // some subtitles have whitespaces in the end/ beginning of line
            subtitleContent = subtitleContent.split(/\r?\n/).map(row => row.trim()).join('\n');
            //-----------------------------------------
            const outputExtension = '.vtt'; // conversion is based on output file extension
            const options = {
                removeTextFormatting: true,
                startAtZeroHour: false,
                timecodeOverlapLimiter: false,
            };
            const { subtitle, status } = convert(subtitleContent, outputExtension, options)
            console.log(status)
            if (subtitle) return { res: "success", subtitle: subtitle, status: status, res: subtitleContent }
            if (status.success) return { res: "success", subtitle: subtitle, status: status, res: res }
            else return { res: "error", subtitle: null }
        } catch (err) {
            console.error(err);
            this.error = err;
            return { res: "error", subtitle: subtitleContent }
        }
    }


    supported = {
        arc: ["application/zip", "application/x-zip-compressed", "application/x-rar", "application/x-rar-compressed", "application/vnd.rar"],
        subs: ["application/x-subrip", "text/vtt", "application/octet-stream", "text/srt"],
        arcs: {
            rar: ["application/x-rar", "application/x-rar-compressed", "application/vnd.rar"],
            zip: ["application/zip", "application/x-zip-compressed"]

        }
    }

    checkExtension(toFilter) { // return index of matched episodes
        return toFilter.match(/.dfxp|.scc|.srt|.ttml|.ssa|.vtt|.ass|.srt/gi)
    }
    checkEpisode(toFilter) {
        var reEpisode = new RegExp(this.episode, "gi");
        return toFilter.match(reEpisode)
    }
    async unzip(file) {
        try {
            var zip = new AdmZip(file);
            var zipEntries = zip.getEntries();
            console.log("zip file count:", zipEntries.length)
            let files = []
            for (var i = 0; i < zipEntries.length; i++) {
                var filename = zipEntries[i].entryName;
                if (!this.checkExtension(filename)) continue;
                if (this.episode) {
                    if (!this.checkEpisode(filename)) continue;
                }
                console.log("matched file : ", filename);
                files.push(zipEntries[i].getData())
                break; // because only takes the first match
            }
            if (files?.length) return files[0]
            else return
        } catch (err) {
            console.error(err);
        }
    }

    async unrar(file) {
        try {
            const extractor = await unrar.createExtractorFromData({ data: file });
            const list = extractor.getFileList();
            const listArcHeader = list.arcHeader; // archive header
            const fileHeaders = [...list.fileHeaders]; // load the file headers
            let filesNames = []
            for (var i = 0; i < fileHeaders.length; i++) {
                var filename = fileHeaders[i].name;
                if (!this.checkExtension(filename)) continue;
                if (this.episode) {
                    if (!this.checkEpisode(filename)) continue;
                }
                console.log("matched file : ", filename);
                filesNames.push(filename)
                break; // because only takes the first match
            }
            const extracted = extractor.extract({ files: filesNames });
            // extracted.arcHeader  : archive header
            const files = [...extracted.files]; //load the files
            files[0].fileHeader; // file header
            files[0].extraction; // Uint8Array content, createExtractorFromData only
            return files[0].extraction
        } catch (err) {
            console.error(err);
        }
    }

    async request(options) {
        if (!this.client) this.getClient()
        return await this.client(options)
            .catch(error => {
                if (error.response) {
                    console.error(error.response.status, error.response.statusText, error.config.url);
                } else if (error.cause) {
                    console.error(error.cause);
                } else {
                    console.error(error);
                }
            });

    }
    getClient() {
        let config = {
            timeout: 15000,
            headers: {}
        }
        if (this.proxy) config.headers = this.proxy;
        config.headers["Accept-Encoding"] = "gzip,deflate,compress";

        this.client = axios.create(config);
    }
    static gerenateUrl(url = String, opts = {}) {
        let { proxy, lang } = opts;
        let proxyString, data;
        data = new URLSearchParams();
        data.append("from", url)
        if (proxy) {
            proxyString = Buffer.from(JSON.stringify(proxy)).toString('base64');
            data.append("proxy", proxyString)
        }
        if (lang) data.append("lang", lang);
        return data.toString();
    }
};

module.exports = sub2vtt;
