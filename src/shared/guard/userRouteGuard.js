
export class UserRouteGuard{
    shouldRoute() {
        // Sync API call here, and the final return value must be `map` to `boolean` if not
        const resultFromSyncApiCall = sessionStorage.getItem('isLoggedIn') == 'true' ? true: false;
        return resultFromSyncApiCall
    }
}