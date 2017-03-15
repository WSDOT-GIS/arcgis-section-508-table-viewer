// tslint:disable-next-line:no-namespace
// tslint:disable-next-line:interface-name
interface URL {
    // searchParams property defined incorrectly as searchparams.
    // This issue is scheduled to be fixed at TypeScript 2.3,
    // at which time this workaround will no longer be necessary.
    // let url = pageUrl.searchParams.get("url");
    searchParams: URLSearchParams;
}
