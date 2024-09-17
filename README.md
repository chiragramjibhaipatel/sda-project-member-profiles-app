# SDA Member Profile App

Using Shopify Remix app template 

## Admin Dashboard
- [ ] Create new member with compulsory fields
  - Email (this will be the username, can't change once created)
  - Password
  - Name
  - Role
- [ ] View all members
  - List all the members with filters(role, profile visibility, display name, email)
  - Reset password
  - Navigate to member profile metaobject enrty in the Shopify Admin

- The member profile details will be stored in the Metaobject
- Password will be stored in the [app-data](https://shopify.dev/docs/apps/build/custom-data/metafields/use-app-data-metafields) metafield
  - ```key : email```
  - ```value : {hendle, hashedPassword}```
  - handle is the handle of metaobject entry for this member
  - used bcrypt to hash the password
- Dashboard will be inside the Shopify Admin as a custom embedded app

## Member Profile
- [ ] Login
  - Email
  - Password
- [ ] Member can update their profile
  - Name
  - Profile visibility
  - Display name
  - Profile picture
  - etc...

 - Login session is maintained in the http only session cookie for one browser session
 - Spam protection for Login page
 - Compulsory reset password on first login
 - Reset password
 - Member dashboard will be available at the app URL(outside of Shopify Admin)
