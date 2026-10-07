# Set up the shared wish wall (about 5 minutes)

1. Go to sheets.google.com and create a blank spreadsheet. Name it "Grace Birthday Wishes".
2. Menu: Extensions > Apps Script.
3. Delete the sample code, paste in everything from apps-script/Code.gs, and click Save.
4. Click Deploy > New deployment. Click the gear icon, choose "Web app".
   - Execute as: Me
   - Who has access: Anyone
5. Click Deploy, approve the permissions (Advanced > Go to project), and copy the Web app URL
   (it ends in /exec).
6. Open js/main.js, find  var WISH_API_URL = '';  and paste the URL between the quotes.
7. Upload the folder again. Wishes now show for everyone and appear in the "Wishes" tab of your sheet.

Notes
- Changed Code.gs later? Use Deploy > Manage deployments > Edit > New version, so the URL stays the same.
- To remove a wish, delete its row in the sheet.
- Anyone with the page link can post, so don't share the link publicly.
