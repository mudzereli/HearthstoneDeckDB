# Hearthstone Deck DB

###Goals of Site:
- Assist in competitive deckbuilding without "Netdecking" card-for-card.
- Statistical information about decks such as Archetype %, Class %, Events, etc.
- Keep ALL deck lists intact and available.
- Easy exporting to Hearthstone Deck Tracker.

###To Do:
- Filters for `Only Include Decks Which Contain These Cards` and `Exclude All Decks Which Contain These Cards` (filters dont stick after filtering)
    + enter all cards from deckdb into an array like Archetypes/Events & add a populate function which can wipeAll or update the counts
    + this way we dont wipe the array every time and the selections stick!
- Easier copy to clipboard for import to HDT
    + convert decks to model above and create a "copy to clipboard" button which reads the counts of the appropriate category to the clipboard
- Card Counts on Deck Stats Panels (i.e. 22 Auto Include Cards)
    + converting decks to model above will be able to count these by appropriate category
- Show card pics / class colors / etc
    + not sure how to do this properly without taking up a lot of zamimg resources