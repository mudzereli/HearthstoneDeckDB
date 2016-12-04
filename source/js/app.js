function toTitleCase(str)
  {
      return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  }

/* AngularJS Module */
angular.module('AngularApp', [
    'ngRoute',
    'ui.bootstrap',
    'door3.css',
    'LocalStorageModule',
    'googlechart',
    'isteven-multi-select',
    'ngclipboard'
])
.filter('titleCase', function() {
  return function(input) {
    input = input || '';
    return input.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  };
})
/* AngularJS Configuration */
.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'views/main.html'
    })
    .when('/decks', {
      templateUrl: 'views/decks.html'
    })
    .when('/helper', {
      templateUrl: 'views/helper.html'
    })
    .otherwise({
      redirectTo: '/'
    });
})
/* Navigation Bar Controller */
.controller('NavbarController', ['$scope','$location', function($scope,$location){
    $scope.IsCollapsed = true;
    $scope.Toggle = function() {
        this.IsCollapsed = !this.IsCollapsed;
    };
    $scope.IsActive = function(path) {
        return path === $location.path();
    };
}])
/* Theme Changer Controller */
.controller('ThemeController', ['$scope','$css','localStorageService', function($scope,$css,localStorageService){
    $scope.Themes = {
      cerulean:  { Name: 'Cerulean'  , ID: 'cerulean'  },
      cosmo:     { Name: 'Cosmo'     , ID: 'cosmo'     },
      cyborg:    { Name: 'Cyborg'    , ID: 'cyborg'    },
      darkly:    { Name: 'Darkly'    , ID: 'darkly'    },
      flatly:    { Name: 'Flatly'    , ID: 'flatly'    },
      journal:   { Name: 'Journal'   , ID: 'journal'   },
      lumen:     { Name: 'Lumen'     , ID: 'lumen'     },
      paper:     { Name: 'Paper'     , ID: 'paper'     },
      readable:  { Name: 'Readable'  , ID: 'readable'  },
      sandstone: { Name: 'Sandstone' , ID: 'sandstone' },
      simplex:   { Name: 'Simplex'   , ID: 'simplex'   },
      slate:     { Name: 'Slate'     , ID: 'slate'     },
      spacelab:  { Name: 'Spacelab'  , ID: 'spacelab'  },
      superhero: { Name: 'Superhero' , ID: 'superhero' },
      united:    { Name: 'United'    , ID: 'united'    },
      yeti:      { Name: 'Yeti'      , ID: 'yeti'      },
      bootstrap: { Name: 'Bootstrap' , ID: 'bootstrap' }
    };
    $scope.ChangeTheme = function(theme) {
      if($scope.CurrentTheme.ID !== 'bootstrap') {
        $css.remove('//maxcdn.bootstrapcdn.com/bootswatch/3.3.4/' + $scope.CurrentTheme.ID + '/bootstrap.min.css');
      } else {
        $css.remove('bootstrap-3.3.4-dist/css/bootstrap.min.css');
      }
      $scope.CurrentTheme = $scope.Themes[theme];
      if($scope.CurrentTheme.ID !== 'bootstrap') {
        $css.add('//maxcdn.bootstrapcdn.com/bootswatch/3.3.4/' + $scope.CurrentTheme.ID + '/bootstrap.min.css');
      } else {
        $css.add('bootstrap-3.3.4-dist/css/bootstrap.min.css');
      }
      localStorageService.set('theme',$scope.CurrentTheme.ID);
    };
    var theme = localStorageService.get('theme');
    if(theme === null || theme == 'undefined') {
      theme = 'bootstrap';
    }
    $scope.CurrentTheme = $scope.Themes[theme];
    $scope.ChangeTheme($scope.CurrentTheme.ID);
}])
/* Main Application Controller */
.controller('AppController', ['$scope','localStorageService', function($scope,localStorageService){
    $scope.BaseURL = '';
    $scope.BaseURL = '/HearthstoneDeckDB';
    $scope.Application =
      {
          Name: 'Hearthstone Deck DB',
          CurrentlySelectedDeckIndex: 0,
          DeckListShowing: []
      };
    $scope.Filters =
      {
        Showing: true,
        StartDate: new Date(2016,11,01),
        EndDate: new Date(),
        Classes: [],
        Archetypes: [],
        Events: [],
        Players: [],
        IncludeDecksWithCards: [],
        ExcludeDecksWithCards: []
      };
    $scope.Classes =
      [
        { name: "Mage"   , icon: "<img src='" + $scope.BaseURL + "/assets/Icon_Mage_64.png'>"   , count: 0, color: "#69CCF0", selected: false },
        { name: "Priest" , icon: "<img src='" + $scope.BaseURL + "/assets/Icon_Priest_64.png'>" , count: 0, color: "#F0F0F0", selected: false },
        { name: "Warlock", icon: "<img src='" + $scope.BaseURL + "/assets/Icon_Warlock_64.png'>", count: 0, color: "#9482C9", selected: false },
        { name: "Shaman" , icon: "<img src='" + $scope.BaseURL + "/assets/Icon_Shaman_64.png'>" , count: 0, color: "#0070DE", selected: false },
        { name: "Warrior", icon: "<img src='" + $scope.BaseURL + "/assets/Icon_Warrior_64.png'>", count: 0, color: "#C79C6E", selected: false },
        { name: "Druid"  , icon: "<img src='" + $scope.BaseURL + "/assets/Icon_Druid_64.png'>"  , count: 0, color: "#FF7D0A", selected: false },
        { name: "Rogue"  , icon: "<img src='" + $scope.BaseURL + "/assets/Icon_Rogue_64.png'>"  , count: 0, color: "#FFF569", selected: false },
        { name: "Hunter" , icon: "<img src='" + $scope.BaseURL + "/assets/Icon_Hunter_64.png'>" , count: 0, color: "#ABD473", selected: false },
        { name: "Paladin", icon: "<img src='" + $scope.BaseURL + "/assets/Icon_Paladin_64.png'>", count: 0, color: "#F58CBA", selected: false }
      ];
    $scope.Archetypes = [];
    $scope.Events = [];
    $scope.Players = [];
    $scope.Cards = [];
    $scope.DeckHelperData = {};
    $scope.StartDatePicker = {};
    $scope.EndDatePicker = {};
    $scope.DeckHelperCards = [];
    $scope.DECKDB = JSON_DECK_DB;
    $scope.FILTERDECKDB = [];
    $scope.Tier1Cards = [];
    $scope.Tier2Cards = [];
    $scope.Tier3Cards = [];
    $scope.Tier4Cards = [];
    $scope.CopyClipboardCards = [];
    $scope.SetupCharts = function()
      {
        // Class Chart
        $scope.ChartByClass = {};
        $scope.ChartByClass.type = "PieChart";
        $scope.ChartByClass.data =
          {
            "cols":  [
                {id: "c", label: "Class", type: "string"},
                {id: "s", label: "Seen", type: "number"}
            ]
          };
        $scope.ChartByClass.options =
          {
            'title':'Filtered Decks by Class',
            'chartArea':{left:0,top:15,width:'90%',height:'75%'}
          };
        // Archetype Chart
        $scope.ChartByArchetype = {};
        $scope.ChartByArchetype.type = "PieChart";
        $scope.ChartByArchetype.data =
          {
            "cols":  [
                {id: "c", label: "Archetype", type: "string"},
                {id: "s", label: "Seen", type: "number"}
            ]
          };
        $scope.ChartByArchetype.options =
          {
            'title':'Filtered Decks by Archetype',
            'chartArea':{left:0,top:15,width:'90%',height:'75%'}
          };
        // Event Chart
        $scope.ChartByEvent = {};
        $scope.ChartByEvent.type = "PieChart";
        $scope.ChartByEvent.data =
          {
            "cols":  [
                {id: "c", label: "Event", type: "string"},
                {id: "s", label: "Seen", type: "number"}
            ]
          };
        $scope.ChartByEvent.options =
          {
            'title':'Filtered Decks by Event',
            'chartArea':{left:0,top:15,width:'90%',height:'75%'}
          };
      };
    $scope.PopulateCards = function(wipeAll)
      {
          var _deckDB;
          var card;
          if(wipeAll)
          {
            $scope.Cards = [];
            _deckDB = $scope.DECKDB;
          }
          else
          {
            for(var i=0;i<$scope.Cards.length;i++)
            {
              card = $scope.Cards[i];
              card.count = 0;
              card.countword = "(" + card.count + " decks)";
            }
            _deckDB = $scope.FILTERDECKDB;
          }
          for(var j=0;j<_deckDB.length;j++)
          {
            var deck = _deckDB[j];
            for(var k=0;k<deck.CARDLIST.length;k++)
            {
              var cardflat = deck.CARDLIST[k];
              card = $scope.LookupCard(cardflat[1]);
              if(card === null || card == 'undefined')
              {
                card = {};
                card.name = cardflat[1];
                card.count = cardflat[0];
                card.countword = "(" + card.count + " decks)";
                card.include = false;
                card.exclude = false;
                $scope.Cards.push(card);
              }
              else
              {
                card.count++;
                card.countword = "(" + card.count + " decks)";
              }
            }
          }
          $scope.Cards.sort(function(a,b)
          {
            return a.count < b.count ? 1
              : a.count > b.count ? -1
              : 0;
          });
      };
    $scope.PopulateDeckArchetypes = function(wipeAll)
      {
        var _deckDB;
        var archetype;
        if(wipeAll)
        {
          $scope.Archetypes = [];
          _deckDB = $scope.DECKDB;
        }
        else
        {
          for(var i=0;i<$scope.Archetypes.length;i++)
          {
            archetype = $scope.Archetypes[i];
            archetype.count = 0;
            archetype.countword = "(" + archetype.count + " decks)";
          }
          _deckDB = $scope.FILTERDECKDB;
        }
        for(var j=0;j<_deckDB.length;j++)
        {
          var deck = _deckDB[j];
          archetype = $scope.LookupArchetype(deck.ARCHETYPE);
          if(archetype === null || archetype == 'undefined')
          {
            archetype = {};
            archetype.name = toTitleCase(deck.ARCHETYPE);
            archetype.count = 1;
            archetype.icon = "<img src='" + $scope.BaseURL + "/assets/Icon_" + toTitleCase(deck.CLASS) + "_64.png'>";
            archetype.countword = "(" + archetype.count + " decks)";
            archetype.selected = false;
            $scope.Archetypes.push(archetype);
          }
          else
          {
            archetype.count++;
            archetype.countword = "(" + archetype.count + " decks)";
          }
        }
        $scope.Archetypes.sort(function(a,b)
        {
          return a.count < b.count ? 1
            : a.count > b.count ? -1
            : 0;
        });
      };
    $scope.PopulateEvents = function(wipeAll)
      {
        var _deckDB;
        var evt;
        if(wipeAll)
        {
          $scope.Events = [];
          _deckDB = $scope.DECKDB;
        }
        else
        {
          for(var i=0;i<$scope.Events.length;i++)
          {
            evt = $scope.Events[i];
            evt.count = 0;
            evt.countword = "(" + evt.count + " decks)";
          }
          _deckDB = $scope.FILTERDECKDB;
        }
        for(var j=0;j<_deckDB.length;j++)
        {
          var deck = _deckDB[j];
          evt = $scope.LookupEvent(deck.EVENT);
          if(evt === null || evt == 'undefined')
          {
            evt = {};
            evt.name = toTitleCase(deck.EVENT);
            evt.count = 1;
            evt.selected = false;
            evt.countword = "(" + evt.count + " decks)";
            $scope.Events.push(evt);
          }
          else
          {
            evt.count++;
            evt.countword = "(" + evt.count + " decks)";
          }
        }
        $scope.Events.sort(function(a,b)
        {
          return a.count < b.count ? 1
            : a.count > b.count ? -1
            : 0;
        });
      };
    $scope.PopulatePlayers = function(wipeAll)
      {
        var _deckDB;
        var player;
        if(wipeAll)
        {
          $scope.Players = [];
          _deckDB = $scope.DECKDB;
        }
        else
        {
          for(var i=0;i<$scope.Players.length;i++)
          {
            player = $scope.Players[i];
            player.count = 0;
            player.countword = "(" + player.count + " decks)";
          }
          _deckDB = $scope.FILTERDECKDB;
        }
        for(var j=0;j<_deckDB.length;j++)
        {
          var deck = _deckDB[j];
          player = $scope.LookupPlayer(deck.PLAYER);
          if(player === null || player == 'undefined')
          {
            player = {};
            player.name = toTitleCase(deck.PLAYER);
            player.count = 1;
            player.selected = false;
            player.countword = "(" + player.count + " decks)";
            $scope.Players.push(player);
          }
          else
          {
            player.count++;
            player.countword = "(" + player.count + " decks)";
          }
        }
        $scope.Players.sort(function(a,b)
        {
          return a.count < b.count ? 1
            : a.count > b.count ? -1
            : 0;
        });
      };
    $scope.UpdateCharts = function()
      {
        for(var i=0;i<$scope.Classes.length;i++)
          $scope.Classes[i].count = 0;
        for(var j=0;j<$scope.FILTERDECKDB.length;j++)
          $scope.LookupClass($scope.FILTERDECKDB[j].CLASS).count++;
        $scope.ChartByClass.data.rows = [];
        for(var k=0;k<$scope.Classes.length;k++)
          $scope.ChartByClass.data.rows.push({c: [{v: toTitleCase($scope.Classes[k].name)},{v: $scope.Classes[k].count}]});
        $scope.ChartByArchetype.data.rows = [];
        for(var l=0;l<$scope.Archetypes.length;l++)
          $scope.ChartByArchetype.data.rows.push({c: [{v: toTitleCase($scope.Archetypes[l].name)},{v: $scope.Archetypes[l].count}]});
        $scope.ChartByEvent.data.rows = [];
        for(var m=0;m<$scope.Events.length;m++)
          $scope.ChartByEvent.data.rows.push({c: [{v: toTitleCase($scope.Events[m].name)},{v: $scope.Events[m].count}]});
        $scope.ChartByClass.data.rows.sort(function(a,b){
          return b.c[1].v < a.c[1].v ? -1
            : b.c[1].v > a.c[1].v ? 1
            : 0;
        });
        $scope.ChartByClass.options.slices =
        {
          0: { color: $scope.LookupClass($scope.ChartByClass.data.rows[0].c[0].v.toLowerCase()).color },
          1: { color: $scope.LookupClass($scope.ChartByClass.data.rows[1].c[0].v.toLowerCase()).color },
          2: { color: $scope.LookupClass($scope.ChartByClass.data.rows[2].c[0].v.toLowerCase()).color },
          3: { color: $scope.LookupClass($scope.ChartByClass.data.rows[3].c[0].v.toLowerCase()).color },
          4: { color: $scope.LookupClass($scope.ChartByClass.data.rows[4].c[0].v.toLowerCase()).color },
          5: { color: $scope.LookupClass($scope.ChartByClass.data.rows[5].c[0].v.toLowerCase()).color },
          6: { color: $scope.LookupClass($scope.ChartByClass.data.rows[6].c[0].v.toLowerCase()).color },
          7: { color: $scope.LookupClass($scope.ChartByClass.data.rows[7].c[0].v.toLowerCase()).color },
          8: { color: $scope.LookupClass($scope.ChartByClass.data.rows[8].c[0].v.toLowerCase()).color }
        };
      };
    $scope.LookupClass = function(c)
      {
        for(var i=0;i<$scope.Classes.length;i++)
        {
          var cls = $scope.Classes[i];
          if(cls.name.toLowerCase() == c.toLowerCase())
            return cls;
        }
        return null;
      };
    $scope.LookupEvent = function(e)
      {
        for(var i=0;i<$scope.Events.length;i++)
        {
          var evt = $scope.Events[i];
          if (evt.name.toLowerCase() == e.toLowerCase())
            return evt;
        }
        return null;
      };
    $scope.LookupPlayer = function(e)
      {
        for(var i=0;i<$scope.Players.length;i++)
        {
          var plr = $scope.Players[i];
          if (plr.name.toLowerCase() == e.toLowerCase())
            return plr;
        }
        return null;
      };
    $scope.LookupArchetype = function(a)
      {
        for(var i=0;i<$scope.Archetypes.length;i++)
        {
          var archetype = $scope.Archetypes[i];
          if (archetype.name.toLowerCase() == a.toLowerCase())
            return archetype;
        }
        return null;
      };
    $scope.LookupCard = function(c)
      {
        for(var i=0;i<$scope.Cards.length;i++)
        {
          var card = $scope.Cards[i];
          if (card.name.toLowerCase() == c.toLowerCase())
            return card;
        }
        return null;
      };
    $scope.FilterArchetypesIncludes = function(a)
      {
        for(var i=0;i<$scope.Filters.Archetypes.length;i++)
          if ($scope.Filters.Archetypes[i].name.toLowerCase() == a.toLowerCase())
            return true;
        return false;
      };
    $scope.FilterClassesIncludes = function(c)
      {
        for(var i=0;i<$scope.Filters.Classes.length;i++)
          if ($scope.Filters.Classes[i].name.toLowerCase() == c.toLowerCase())
            return true;
        return false;
      };
    $scope.FilterEventsIncludes = function(e)
      {
        for(var i=0;i<$scope.Filters.Events.length;i++)
          if ($scope.Filters.Events[i].name.toLowerCase() == e.toLowerCase())
            return true;
        return false;
      };
    $scope.FilterPlayersIncludes = function(e)
      {
        for(var i=0;i<$scope.Filters.Players.length;i++)
          if ($scope.Filters.Players[i].name.toLowerCase() == e.toLowerCase())
            return true;
        return false;
      };
    $scope.FilterIncludeCardsIncludes = function(deck)
      {
        var ret = true;
        var filterincludes = false;
        for(var i=0;i<$scope.Filters.IncludeDecksWithCards.length;i++)
        {
          var filter = $scope.Filters.IncludeDecksWithCards[i];
          filterincludes = false;
          for(var j=0;j<deck.CARDLIST.length;j++)
          {
            var card = deck.CARDLIST[j];
            if (filter.name.toLowerCase() == card[1].toLowerCase() && filter.include)
            {
              filterincludes = true;
              break;
            }
          }
          if(!filterincludes)
            ret = false;
        }
        return ret;
      };
    $scope.FilterExcludeCardsIncludes = function(deck)
      {
        for(var i=0;i<$scope.Filters.ExcludeDecksWithCards.length;i++)
        {
          var filter = $scope.Filters.ExcludeDecksWithCards[i];
          for(var j=0;j<deck.CARDLIST.length;j++)
          {
            var card = deck.CARDLIST[j];
            if (filter.name.toLowerCase() == card[1].toLowerCase() && filter.exclude)
              return true;
          }
        }
        return false;
      };
    $scope.GetCardCount = function(cards)
      {
        var count = 0;
        for(var i=0;i<cards.length;i++)
        {
          var card = cards[i];
          count = count + Math.round(card.TOTALCOUNT / card.SEENCOUNT);
        }
        return count;
      };
    $scope.FilterDecks = function()
      {
        $scope.DeckHelperData = {};
        $scope.DeckHelperCards = [];
        $scope.FILTERDECKDB = [];
        $scope.Application.DeckListShowing = [];
        for(var i=0;i<$scope.DECKDB.length;i++)
        {
          var deck = $scope.DECKDB[i];
          var dt = new Date(deck.DATE);
          if(dt >= $scope.Filters.StartDate)
            if(dt <= $scope.Filters.EndDate)
              if($scope.Filters.Classes.length === 0 || $scope.FilterClassesIncludes(deck.CLASS))
                if($scope.Filters.Archetypes.length === 0 || $scope.FilterArchetypesIncludes(deck.ARCHETYPE))
                  if($scope.Filters.Events.length === 0 || $scope.FilterEventsIncludes(deck.EVENT))
                    if($scope.Filters.Players.length === 0 || $scope.FilterPlayersIncludes(deck.PLAYER))
                      if($scope.Filters.IncludeDecksWithCards.length === 0 || $scope.FilterIncludeCardsIncludes(deck))
                        if($scope.Filters.ExcludeDecksWithCards.length === 0 || !$scope.FilterExcludeCardsIncludes(deck))
                          {
                            $scope.FILTERDECKDB.push(deck);
                            for(var j=0;j<deck.CARDLIST.length;j++)
                            {
                              var card = deck.CARDLIST[j];
                              var cardName = card[1];
                              var cardCount = card[0];
                              if(!$scope.DeckHelperCards.includes(cardName))
                              {
                                $scope.DeckHelperCards.push(cardName);
                                $scope.DeckHelperData[cardName] = {};
                                $scope.DeckHelperData[cardName].NAME = cardName;
                                $scope.DeckHelperData[cardName].SEENCOUNT = 1;
                                $scope.DeckHelperData[cardName].TOTALCOUNT = cardCount;
                              }
                              else
                              {
                                $scope.DeckHelperData[cardName].SEENCOUNT++;
                                $scope.DeckHelperData[cardName].TOTALCOUNT = $scope.DeckHelperData[cardName].TOTALCOUNT + cardCount;
                              }
                            }
                          }
        }
        $scope.DeckHelperCards.sort(function(a,b){
          return  $scope.DeckHelperData[a].SEENCOUNT < $scope.DeckHelperData[b].SEENCOUNT ? 1
            : $scope.DeckHelperData[a].SEENCOUNT > $scope.DeckHelperData[b].SEENCOUNT ? -1
            : 0;
        });
        $scope.FILTERDECKDB.sort(function(a,b){
          return a.DATE < b.DATE ? 1
            : a.DATE > b.DATE ? -1
            : 0;
        });
        $scope.Tier1Cards = $scope.GetFilteredCardsBetween(90,101);
        $scope.Tier2Cards = $scope.GetFilteredCardsBetween(65,90);
        $scope.Tier3Cards = $scope.GetFilteredCardsBetween(35,65);
        $scope.Tier4Cards = $scope.GetFilteredCardsBetween(0,35);
        $scope.CopyClipboardCards = $scope.GetFilteredCardsBetween(65,101);
      };
    $scope.SelectDeck = function(index)
      {
        $scope.Application.CurrentlySelectedDeck = $scope.FILTERDECKDB[index];
      };
    $scope.OpenStartDatePicker = function ($event)
      {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.StartDatePicker.opened = true;
      };
    $scope.OpenEndDatePicker = function ($event)
      {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.EndDatePicker.opened = true;
      };
    $scope.GetTextListFromDeckList = function(cards)
      {
        var list = "";
        for(var i=0;i<cards.length;i++)
        {
          var card = cards[i];
          list = list + card[0] + " " + card[1] + "\n";
        }
        return list;
      };
    $scope.GetTextListFromCardGroup = function(cards)
      {
        var list = "";
        for(var i=0;i<cards.length;i++)
        {
          var card = cards[i];
          list = list + Math.round(card.TOTALCOUNT / card.SEENCOUNT) + " " + card.NAME + "\n";
        }
        return list;
      };
    $scope.GetFilteredCardsBetween = function(lowPCT,highPCT)
      {
        var list = [];
        var deckcount = $scope.FILTERDECKDB.length;
        var seenPCT = 0;
        for(var i=0;i<$scope.DeckHelperCards.length;i++)
        {
          var card = $scope.DeckHelperData[$scope.DeckHelperCards[i]];
          seenPCT = card.SEENCOUNT / deckcount * 100;
          if(seenPCT >= lowPCT && seenPCT < highPCT)
            list.push(card);
        }
        return list;
      };
    $scope.ResetFilters = function()
      {
        for(var i=0;i<$scope.Classes.length;i++)
          $scope.Classes[i].selected = false;
        for(var j=0;j<$scope.Archetypes.length;j++)
          $scope.Archetypes[j].selected = false;
        for(var k=0;k<$scope.Events.length;k++)
          $scope.Events[k].selected = false;
        for(var m=0;m<$scope.Events.length;m++)
          $scope.Players[m].selected = false;
        for(var l=0;l<$scope.Cards.length;l++)
        {
          var card = $scope.Cards[l];
          card.include = false;
          card.exclude = false;
        }
        $scope.Filters.StartDate = new Date(2016,11,01);
        $scope.Filters.EndDate = new Date();
      };
    $scope.Calculate = function()
      {
        $scope.FilterDecks();
        $scope.PopulateDeckArchetypes(false);
        $scope.PopulateEvents(false);
        $scope.PopulatePlayers(false);
        $scope.PopulateCards(false);
        $scope.UpdateCharts();
        $scope.Application.CurrentlySelectedDeckIndex = 0;
        $scope.SelectDeck($scope.Application.CurrentlySelectedDeckIndex);
      };
    $scope.GetCardImage = function(name)
    {
      for(var i=0;i<CARDDB.length;i++)
      {
        var card = CARDDB[i];
        if(card.name.toLowerCase() === name.toLowerCase())
          return "http://media.services.zam.com/v1/media/byName/hs/cards/enus/" + card.id + ".png";
      }
      return "Card Image Not Found!";
    };
    $scope.PopulateDeckArchetypes(true);
    $scope.PopulateEvents(true);
    $scope.PopulatePlayers(true);
    $scope.PopulateCards(true);
    $scope.SetupCharts();
    $scope.Calculate();
}]);