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
    'isteven-multi-select'
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
    $scope.Application =
      {
          Name: 'Hearthstone Deck DB',
          CurrentlySelectedDeckIndex: 0,
          DeckListShowing: []
      };
    $scope.Filters = {
      Showing: true,
      StartDate: new Date(2016,09,04),
      EndDate: new Date(),
      Classes: [],
      Archetypes: [],
      Events: [],
      IncludeDecksWithCards: [],
      ExcludeDecksWithCards: []
    };
    $scope.Classes = [
      { name: "Mage"   , icon: "<img src='/assets/Icon_Mage_64.png'>"   , count: 0, color: "#69CCF0", selected: false },
      { name: "Priest" , icon: "<img src='/assets/Icon_Priest_64.png'>" , count: 0, color: "#F0F0F0", selected: false },
      { name: "Warlock", icon: "<img src='/assets/Icon_Warlock_64.png'>", count: 0, color: "#9482C9", selected: false },
      { name: "Shaman" , icon: "<img src='/assets/Icon_Shaman_64.png'>" , count: 0, color: "#0070DE", selected: false },
      { name: "Warrior", icon: "<img src='/assets/Icon_Warrior_64.png'>", count: 0, color: "#C79C6E", selected: false },
      { name: "Druid"  , icon: "<img src='/assets/Icon_Druid_64.png'>"  , count: 0, color: "#FF7D0A", selected: false },
      { name: "Rogue"  , icon: "<img src='/assets/Icon_Rogue_64.png'>"  , count: 0, color: "#FFF569", selected: false },
      { name: "Hunter" , icon: "<img src='/assets/Icon_Hunter_64.png'>" , count: 0, color: "#ABD473", selected: false },
      { name: "Paladin", icon: "<img src='/assets/Icon_Paladin_64.png'>", count: 0, color: "#F58CBA", selected: false }
    ];
    $scope.FilteredDeckCards = [];
    $scope.Archetypes = [];
    $scope.Events = [];
    $scope.DeckHelperData = {};
    $scope.StartDatePicker = {};
    $scope.EndDatePicker = {};
    $scope.DeckHelperCards = [];
    $scope.DECKDB = JSON_DECK_DB;
    $scope.FILTERDECKDB = [];
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
    $scope.PopulateFilterCards = function()
    {

    };
    $scope.PopulateDeckArchetypes = function(wipeAll)
      {
        var _deckDB;
        if(wipeAll)
        {
          $scope.Archetypes = [];
          _deckDB = $scope.DECKDB;
        }
        else
        {
          angular.forEach($scope.Archetypes, function(a) {
            a.count = 0;
            a.countword = "(" + a.count + " decks)";
          });
          _deckDB = $scope.FILTERDECKDB;
        }
        angular.forEach(_deckDB, function(deck) {
          var archetype = $scope.LookupArchetype(deck.ARCHETYPE);
          if(archetype === null || archetype == 'undefined')
          {
            archetype = {};
            archetype.name = toTitleCase(deck.ARCHETYPE);
            archetype.count = 1;
            archetype.icon = "<img src='/assets/Icon_" + toTitleCase(deck.CLASS) + "_64.png'>";
            archetype.countword = "(" + archetype.count + " decks)";
            archetype.selected = false;
            $scope.Archetypes.push(archetype);
          }
          else
          {
            archetype.count++;
            archetype.countword = "(" + archetype.count + " decks)";
          }
        });
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
        if(wipeAll)
        {
          $scope.Events = [];
          _deckDB = $scope.DECKDB;
        }
        else
        {
          angular.forEach($scope.Events, function(evt) {
            evt.count = 0;
            evt.countword = "(" + evt.count + " decks)";
          });
          _deckDB = $scope.FILTERDECKDB;
        }
        angular.forEach(_deckDB, function(deck) {
          var evt = $scope.LookupEvent(deck.EVENT);
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
        });
        $scope.Events.sort(function(a,b)
        {
          return a.count < b.count ? 1
            : a.count > b.count ? -1
            : 0;
        });
      };
    $scope.UpdateCharts = function()
      {
        angular.forEach($scope.Classes,function(c){
          c.count = 0;
        });
        angular.forEach($scope.FILTERDECKDB,function(d){
          $scope.LookupClass(d.CLASS).count++;
        });
        $scope.ChartByClass.data.rows = [];
        var r;
        var list = $scope.Classes;
        angular.forEach(list,function(cc) {
          r = {c: [{v: toTitleCase(cc.name)},{v: cc.count}]};
          $scope.ChartByClass.data.rows.push(r);
        });
        $scope.ChartByArchetype.data.rows = [];
        list = $scope.Archetypes;
        angular.forEach(list,function(a) {
          r = {c: [{v: toTitleCase(a.name)},{v: a.count}]};
          $scope.ChartByArchetype.data.rows.push(r);
        });
        $scope.ChartByEvent.data.rows = [];
        list = $scope.Events;
        angular.forEach(list,function(e) {
          r = {c: [{v: toTitleCase(e.name)},{v: e.count}]};
          $scope.ChartByEvent.data.rows.push(r);
        });
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
        var ret = null;
        angular.forEach($scope.Classes,function(cls){
          if (cls.name.toLowerCase() == c.toLowerCase())
          {
            ret = cls;
            return;
          }
        });
        return ret;
      };
    $scope.LookupEvent = function(e)
      {
        var ret = null;
        angular.forEach($scope.Events,function(evt){
          if (evt.name.toLowerCase() == e.toLowerCase())
          {
            ret = evt;
            return;
          }
        });
        return ret;
      };
    $scope.LookupArchetype = function(a)
      {
        var ret = null;
        angular.forEach($scope.Archetypes,function(archetype){
          if (archetype.name.toLowerCase() == a.toLowerCase())
          {
            ret = archetype;
            return;
          }
        });
        return ret;
      };
    $scope.FilterArchetypesIncludes = function(a)
      {
        var ret = false;
        angular.forEach($scope.Filters.Archetypes,function(filter){
          if (filter.name.toLowerCase() == a.toLowerCase())
          {
            ret = true;
            return;
          }
        });
        return ret;
      };
    $scope.FilterClassesIncludes = function(c)
      {
        var ret = false;
        angular.forEach($scope.Filters.Classes,function(filter){
          if (filter.name.toLowerCase() == c.toLowerCase())
            ret = true;
          return;
        });
        return ret;
      };
    $scope.FilterEventsIncludes = function(e)
      {
        var ret = false;
        angular.forEach($scope.Filters.Events,function(filter){
          if (filter.name.toLowerCase() == e.toLowerCase())
            ret = true;
            return;
        });
        return ret;
      };
    $scope.FilterIncludeCardsIncludes = function(deck)
      {
        var ret = false;
        angular.forEach($scope.Filters.IncludeDecksWithCards,function(filter){
          angular.forEach(deck.CARDLIST,function(card){
            if (filter.name.toLowerCase() == card[1].toLowerCase())
              ret = true;
              return;
          });
        });
        return ret;
      };
    $scope.FilterExcludeCardsIncludes = function(e)
      {
        var ret = false;
        angular.forEach($scope.Filters.ExcludeDecksWithCards,function(filter){
          angular.forEach(deck.CARDLIST,function(card){
            if (filter.name.toLowerCase() == card[1].toLowerCase())
              ret = true;
              return;
          });
        });
        return ret;
      };
    $scope.FilterDecks = function()
    // TODO : MAKE CARDS APPEAR BACK ON FILTER LIST
      {
        $scope.FilteredDeckCards = [];
        $scope.DeckHelperData = {};
        $scope.DeckHelperCards = [];
        $scope.FILTERDECKDB = [];
        $scope.Application.DeckListShowing = [];
        for(var i=0;i<$scope.DECKDB.length;i++)
        {
          var deck = $scope.DECKDB[i];
          var dt = new Date(deck.DATE);
          if($scope.Filters.Classes.length === 0 || $scope.FilterClassesIncludes(deck.CLASS))
            if($scope.Filters.Archetypes.length === 0 || $scope.FilterArchetypesIncludes(deck.ARCHETYPE))
              if($scope.Filters.Events.length === 0 || $scope.FilterEventsIncludes(deck.EVENT))
                if($scope.Filters.IncludeDecksWithCards.length === 0 || $scope.FilterIncludeCardsIncludes(deck))
                  if($scope.Filters.ExcludeDecksWithCards.length === 0 || !$scope.FilterExcludeCardsIncludes(deck))
                    if(dt >= $scope.Filters.StartDate)
                      if(dt <= $scope.Filters.EndDate)
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
                          // TODO : MAKE CARDS APPEAR BACK ON FILTER LIST
                          var _card = {name: cardName, include: false, exclude: false};
                          $scope.FilteredDeckCards.push(_card);
                          $scope.DeckHelperData[cardName] = {};
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
        $scope.FilteredDeckCards.sort(function(a,b){
          return  a.name < b.name ? -1
            : a.name > b.name ? 1
            : 0;
        });
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
    $scope.ResetFilters = function()
      {
        angular.forEach($scope.Classes,function(c){
          c.selected = false;
        });
        angular.forEach($scope.Archetypes,function(c){
          c.selected = false;
        });
        angular.forEach($scope.Events,function(c){
          c.selected = false;
        });
        $scope.Filters.StartDate = new Date(2016,09,04);
        $scope.Filters.EndDate = new Date();
        //$scope.Calculate();
      };
    $scope.Calculate = function()
    {
      $scope.FilterDecks();
      //$scope.UpdateCharts();
      $scope.PopulateDeckArchetypes(false);
      $scope.PopulateEvents(false);
      $scope.UpdateCharts();
      $scope.Application.CurrentlySelectedDeckIndex = 0;
      $scope.SelectDeck($scope.Application.CurrentlySelectedDeckIndex);
    };
    $scope.PopulateDeckArchetypes(true);
    $scope.PopulateEvents(true);
    $scope.SetupCharts();
    $scope.Calculate();
}]);