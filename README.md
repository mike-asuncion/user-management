# User Management - Edit Users
A responsive demo of the "User Management - Edit Users" screen. Built with plain HTML, SCSS file, Bootstrap 5 and jQuery. Demo data using JSon files.

## How to run the project

Node.js (version 18 or newer)

install node

   ```
   npm install
   ```

run project 

   ```
   npm run cms
   ```

This will auto launch http://localhost:3030 in your browser.

- Auto watch SCSS compiler
- Auto watch file changes

To stop it, press Ctrl + C in the terminal.

## Changing the port
The page runs on port 3030. To use another port, open `package.json`, find the `serve` line, and change `--port=3030` to the number you want.

## Folder layout
```
index.html                     the page
scss/style.scss                all custom styles (the only style file you edit)
css/style.css                  made automatically from style.scss
js/app.js                      all jQuery code
data/users.json                the 55 mock users
data/options.json              the choices shown in the dropdowns
```

## Editing the mock data
Open `data/users.json`. Edit the json files.

Copy a block, change the values, save. The page reloads on its own. Keep a comma between users and make sure every `id` and `email` is different.

`data/options.json` holds the lists for the Status, Group, Division, Region and User Type dropdowns. Add a word to a list and it shows up in the filters and in the Add or Edit form.

## How it works

User page gets data from the json files.

1. When the page opens, jQuery fetches `users.json` and `options.json` using "ajax".
2. Realtime search filter when you type in the search box.
3. Add, Edit, Disable and Delete change that list, then the table is drawn again after page refresh.
4. The pagination buttons simply change which slice of the matching list is shown.

The code is split into small, clearly named functions like `getFilteredUsers`, `showUsers`, `openUserForm` and `deleteUser`, so you can find things by name.


## How the navigation behaves on each screen / UI/UX responsive fixes

- Wide screens: the full top menu and the left sidebar are shown
- Medium screens: when the top menu does not fit, a round right arrow appears. Tap it to slide the menu and see the hidden items. A left arrow appears once you have moved, so you can go back.
- Tablets and phones: the sidebar is hidden and a menu button (three lines) appears at the top left. It opens a drawer from the left side. Inside the drawer, "Main menu" and "User management" can be opened and closed to show their sub items. The drawer closes after you pick a page.
- Phones: the top menu is fully moved into the drawer and each user in the table becomes a small card that is easy to read without scrolling sideways.

## Assumptions & UI/UX responsive fixes

Menu horizontal sliding if the screen is small (sub menus sliding open, the filter panel sliding, the menu arrows scrolling, rows fading in, the message box) is done with jQuery. The SCSS has no animations and does not change any Bootstrap class. It only styles its own classes, such as `.top-nav-link`, `.side-link` and `.user-table`. No mixins were needed because the animations live in jQuery.


- The "cancel or disable" icon means "disable user". It now switches a user between Disabled and Active. A separate red trash icon was added for delete.
- The Status filter needs something to filter on, so each user has a status: Active, Pending or Disabled.
- The "User Type". It is filled with Employee, Contractor or Partner so the column has meaning.
- "Division" holds state codes (NY, CA, TX) and "Region" holds areas (Corporate, West, South).
- All sidebar items and top menu items other than Home and Edit Users open a blank page for now.
- Changes you make on the page (add, edit, delete) are kept only until you refresh. To make a change stick, edit `data/users.json`.
- New users get the next ID number after the highest one, and today's date as the submitted date.
- Bootstrap, Bootstrap Icons and jQuery load from the internet (CDN), so you need a connection when working.

## UI and UX changes

- Added the right and left arrows on the top menu, and the left-side drawer on smaller screens.
- Added a Group filter next to Status, Region and Division.
- Added a Status column with colored labels, so you can see who is active at a glance.
- Added a small counter on the Filters button showing how many filters are on.
- Added a clear (x) button inside the search box.
- Added a "rows per page" choice (10, 25, 50).
- The "Showing 1 to 10 of 55 entries" text also says how many were filtered out.
- The Actions column stays visible on tablets even when the table scrolls sideways.
- On phones the filter panel starts closed to save space. Tap Filters to open it.
- A message appears at the bottom right after adding, editing, disabling or deleting a user.
- Delete asks you to confirm first.
- The Add and Edit form checks for empty names, a valid email, and an email that is already used.
- Long emails are cut with "..." on desktop, with the full email shown when you hover.
- When nothing matches, a short message appears with a button to clear the search and filters.

## AI Tools used and where specifically

- I used OpenAI for the creating the list needed for the README file (after analyzing the page)
- I used Claude in creating complex pagination and realtime filters
- I used FIGMA in creating the base HTML from the image reference

Stylings, responsiveness, adding offcanvas in mobile, ajax and other jQuery methods are done from scratch.
I added simple ping back to my website to know if build actually works. Remove it if you're not comfortable with it.