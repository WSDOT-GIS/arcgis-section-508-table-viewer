import { matchRegExps } from "./reUtils";

/**
 * Creates a <span> with classes defining a font awesome icon.
 * @param url A URL
 */
export function getFontAwesomeFileIcon(url: string) {
    const pdfRe = /\.pdf$/i;
    const excelRe = /\.xlsx?$/i;
    const archiveRe = /\.((zip)|(7z)|(rar)|(tar)|(gz))/i;
    const videoRe = /\.((wmv)|(avi)|(mp4)|(m4v)|(mkv))$/i;
    const imageRe = /\.((jpe?g)|(png)|(bmp)|(tga)|(gif)|(tiff?))$/i;
    const audioRe = /\.((wav)|(mp3)|(ogg))$/i;
    const textRe = /\.((te?xt))$/i;
    const otherRe = /[^.]+\.\w+$/i;

    let [
        pdf,
        excel,
        archive,
        video,
        image,
        audio,
        text,
        other] = matchRegExps(url, true,
            pdfRe,
            excelRe,
            archiveRe,
            videoRe,
            imageRe,
            audioRe,
            textRe,
            otherRe);
    let typeName: string | null;

    if (pdf) {
        typeName = "file-pdf-o";
    } else if (excel) {
        typeName = "file-excel-o";
    } else if (archive) {
        typeName = "file-archive-o";
    } else if (video) {
        typeName = "file-video-o";
    } else if (image) {
        typeName = "file-image-o";
    } else if (audio) {
        typeName = "file-audio-o";
    } else if (text) {
        typeName = "file-text-o";
    } else if (other) {
        typeName = "file";
    } else {
        typeName = "external-link";
    }

    let span = document.createElement("span");
    span.classList.add("fa", `fa-${typeName}`);
    span.setAttribute("aria-hidden", "true");
    return span;
}

