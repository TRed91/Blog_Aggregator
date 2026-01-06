# Blog Aggregator

In order to run the CLI you need a Postgres DB and a config file in the home directory called **.gatorconfig.json**

## .gatorconfig.json

The .gatorconfig.json is created or overwridden when a user registers or logges in.
It looks as follows:

```
{
  "db_url": "connection_string_goes_here",
  "current_user_name": "username_goes_here"
}
```

The connection string needs to be provided in a .env file with the field name `DB_CONNECTION_STRING`
or set in the .gatorconfig.json file.

## commands:

|command      |args                            |description                                                                    | 
|-------------|--------------------------------|-------------------------------------------------------------------------------|
|register     |username                        |registers and logs in the user with the provided name                          |
|login        |     username                   |logs in the user with the provided name                                        |
|reset        |                                |resets the db. **Warning!** Deletes any rows in the db! for testing purposes   |
|users        |                                |lists all registered users                                                     |
|agg          |fetch interval in ms, s, m or h |continiously aggregates posts for any stored feeds in the given time interval  |
|addfeed      |feed name, feed url             |adds a new feed. requires a user to be logged in                               |
|feeds        |                                |lists all feeds currently in the db                                            |
|follow       |feed url                        |lets a user follow a given feed                                                |
|following    |                                |lists all feeds the current user is following                                  |
|unfollow     |feed url                        |removed a follow for the feed with the given url for the current user          |
|browse       |limit *optional*                |lists all posts for the current user ordered by recency. Limit default to 2    |
