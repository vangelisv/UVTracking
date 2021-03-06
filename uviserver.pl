% :- assert(library_directory('c:/sw/development/pl')).

:- use_module(library(thea2/owl2_model)).
:- use_module(library('thea2/owl2_from_rdf')).
:- use_module(library('thea2/owl2_rl_rules')).
:- use_module(library('thea2/owl2_util')).
:- use_module(library('thea2/apps/opencalais/thea_opencalais')).


:- use_module(library('semweb/rdf_db.pl')).
:- use_module(library(readutil)).

:-use_module(library('http/http_open')).
:-use_module(library('http/http_client')).
:-use_module(library('http/thread_httpd')).
:-use_module(library(sgml)).
:-use_module(dcg_utils).

:-use_module(library(http/json)).
:-use_module(library(http/json_convert)).
:-use_module(library(http/http_json)).
:-use_module(library(record)).

%%	module

:- dynamic(visited/1).
:- dynamic(location_story_body/2).
:- dynamic(expanded_node/1).
:- dynamic(blocked_property/1).



% --------------------------------------------
%
%
% arity 29
:- json_object placefinder(quality,latitude,longitude,offsetlat,offsetlon,radius,name,
			   line1,line2,line3,line4,house,street,xstreet,unittype,unit,postal,neighborhood,
			   city,county,state,country,countrycode,statecode,countycode,hash,woeid,woetype,uzip).

% JSON object to be communicated between server and mobile app
% date is of 'Tue, 23 Mar 2011'
% time is 23:45:40 TZN or '' for forecast
% uni,effuvi numbers (one decimal)
% link is the link to provide current weather and forecast for nearest location
% units is 'c' of 'f'
% temp,maxtemp,mintemp termarature current or forecast, integer
:- json_object uvidata(date,time, uvi,effuvi, link, ywcode,ywtext, unit, temp, high, low).



%% get_placefinders(+ResultSet:xml, -Places:list) is det
%
% Parses an XML structure returned from the PlaceFinder Yahoo service
% and returns a list of prolog terms representing places
%
% @ param ResultSet The Places result set as it is returned by Yahoo
% service.
% @ param Places List of returned places as placefinder/29 terms.

get_placefinders(ResultSet,Places) :-
	ResultSet = [element('ResultSet',[version='1.0'],Elements)],
	findall(Place,
		(member(element('Result',_,ResultElements),Elements),
		 findall(Value,(
			       member(element(_,_,ValueA),ResultElements),
				(   ValueA = [] -> Value = '' ; ValueA =[Value])
			       ),Attrs),
		 Place =.. [placefinder|Attrs]
		),
		Places).


get_placefinders(ResultSet,[]) :-
	debug(placefinder,'Yahoo Place finder parser error - unexpected resultset ~w',[ResultSet]).


get_placefinder_woeid(Place,Woeid) :-
	arg(27,Place,Woeid).

%% yahoo_weather(+Woeid:atom, +U:atom, -Result:list) is det
%
% Calls the yahoo wheather service and parses the result.
%
% @ param Woeid The ID of the place as retutned by the PlaceFinder
% service.
% @ param U= F(arenhait) or C(elcius).
% @ param Result Custom result, currently list os

yahoo_weather(Woeid,Unit,WeatherData) :-
	atomic_list_concat(['http://weather.yahooapis.com/forecastrss?w=',Woeid,'&u=',Unit],HTTPQuery),
	http_open(HTTPQuery, Stream, []),
	load_structure(Stream,Result,[dialect(xml),space(sgml)]),
	close(Stream),
	debug(http_server,'yahoo forecast rss: ~w',[Result]),
	Result = [element(rss,_,[element(channel,_,ChannelEl)|_])|_],
	member(element(link,_,[Link]),ChannelEl),!,
	(   member(element(item,_,ItemEl),ChannelEl) ->
	    findall(WDataEl,
		    (	member(element('yweather:condition',Condition,_),ItemEl),
			yw_weather_data(Condition,Link,Unit,condition,WDataEl) ;

		    member(element('yweather:forecast',Forecast,_),ItemEl),
			yw_weather_data(Forecast,Link,Unit,forecast,WDataEl)
		    ),
		    WeatherData)
	; WeatherData = []
	).

% If no proper data from service return empty list.
yahoo_weather(_Woeid,_Unit,[]).


yw_weather_data(YWData,Link,Unit,condition,weatherdata(Date,Time,Link,Code,Text,Unit,Temp,'','')) :-
	member(date=DateTime,YWData),
	atom_codes(DateTime,DTCodes),phrase(date_time(Date,Time),DTCodes,[]),
	member(text=Text,YWData),
	member(code=Code,YWData),
	member(temp=Temp,YWData),!.

yw_weather_data(YWData,Link,Unit,forecast,weatherdata(Date,'',Link,Code,Text,Unit,'',High,Low)) :-
	member(day=Day,YWData),
	member(date=Date1,YWData),
	atomic_list_concat([Day,', ',Date1],Date),
	member(text=Text,YWData),
	member(code=Code,YWData),
	member(low=Low,YWData),
	member(high=High,YWData),!.


%% merge_uvi_weather(+UVI:list, +Weather:list -Merged:list
%% is det
%
% Merges the UVI index data with weather data.
%
% @ param UVI list of uvindex('&nbsp; 30 Mar 2011 ',noon,'11.9 '),
% @ param Weather list of weatherdata(Date, Time, Link,Code,Text,Unit,Temp,High, Low)
% @param Merged list of uvidata(date,time, uvi,effuvi, link,ywcode,ywtext, unit, temp, high, low).

merge_uvi_weather(UVIList,Weather,Merged) :-
	findall(uvidata(Date,Time, UVI, EffUVI, Link, YWCode,YWText, Unit, Temp, High, Low),
		(   member(uvindex(UVDate,_UVTime,UVI),UVIList),
		    (	get_dates_weather_data(condition,UVDate,Weather,Date, Time,Link,YWCode,YWText,Unit,Temp,_High,_Low) ->
		    get_dates_weather_data(forecast,UVDate,Weather,_Date,_Time,_Link,_YWCode, _YText, _Unit, _Temp, High,Low) ;
		    (	get_dates_weather_data(forecast,UVDate,Weather,Date,Time,Link,YWCode, YWText, Unit, Temp, High,Low) -> true;
		    Date = UVDate, Time = '', Link = '', YWCode = '', YWText = '' , Unit = '', Temp = '' , High = '' , Low = '')
		    ),
		    calc_eff_uvi(UVI, Time, YWCode, EffUVI)),
		Merged),!.

get_dates_weather_data(Mode,UVDate, WeatherData, Date, Time, Link, Code, Text, Unit, Temp, High, Low) :-
	member(weatherdata(Date, Time, Link,Code,Text,Unit,Temp,High, Low),WeatherData),
	sub_atom(Date,_,_,_,UVDate),
	(   Mode = condition -> Time \= '' ; Time = '' ),!, %
	debug(merging,'Mode ~w, UVDATE ~w, DATE ~w',[Mode, UVDate,Date]).

calc_eff_uvi(UVI,_,_,UVI).




get_and_parse_uvindex(Service, Lat,Long, WUVData) :-
	nb_setval(dcg_mode,p),
	service_description(Service,Lat,Long,HTTPQuery,Grammar),
	http_get(HTTPQuery,R,[timeout(5)]),
	atom_codes(R,Codes),
	Term =.. [Grammar,UVIndex],
	debug(http_server,'before parsing uvi service:~w',[Term]),
	phrase(Term,Codes,_Rest),!, % Just once get UVIndex data
	debug(http_server,'UVIndex :~w',[UVIndex]),
	service_description('PlaceFinder',Lat,Long,HTTPQuery2,_Grammar2),
	% http_get(HTTPQuery2,R2,[]),
	http_open(HTTPQuery2, Stream, []),
	load_structure(Stream,R2,[dialect(xml),space(sgml)]),
	debug(http_server,'PlaceFinder :~w',[R2]),
	get_placefinders(R2,[Place|_]),
	get_placefinder_woeid(Place,Woeid),
	close(Stream),
	debug(http_server,'Woeid :~w',[Woeid]),
	yahoo_weather(Woeid,c,Weather),
	merge_uvi_weather(UVIndex,Weather,WUVData),!.
	%prolog_to_json(Merged,WJSON),
	%reply_json(WJSON),nl.

service_description(temis, Lat,Long, HTTPQuery, temis_dcg) :-
       atomic_list_concat(['http://www.temis.nl/uvradiation/nrt/uvindex.php?lon=',Long,'&lat=',Lat],HTTPQuery).

service_description('PlaceFinder', Lat,Long, HTTPQuery, place_finder_dcg) :-
       atomic_list_concat(['http://where.yahooapis.com/geocode?q=',Lat,',',Long,'&gflags=R&appid=','4wbGCM32'],HTTPQuery).

go(Lat,Long,WUVData) :-
	nb_setval(dcg_mode,p),
	get_and_parse_uvindex(temis,Lat,Long, WUVData).
go(WUVData) :-
	nb_setval(dcg_mode,p),
	get_and_parse_uvindex(temis,40.567434,22.983676, WUVData).
test_service(Lat,Long) :-
	http_post('http://localhost:8082', json(json([long=Long,lat=Lat])), Reply, [content_type(text)]),
	print(Reply),nl.

                 /*******************************
		 *   UVTracker HTTP SERVICE    *
		 *******************************/


init_service(Port) :-
	(   nonvar(Port), !, http_server(uvservice_handle,[port(Port),workers(1)]) ; true).

uvservice_handle(Request) :-
	debug(http_server,'request 1 ~w',Request),
	http_read_json(Request, JSONIn),
	debug(http_server,'json in ~w',JSONIn),
	JSONIn = json([long=Long,lat=Lat]),
	debug(http_server,'LONG,LAT ~w ~w',[Long,Lat]),
	get_and_parse_uvindex(temis,Lat,Long,WUVData),
	debug(http_server,'temis parsed uvindex ~w',WUVData),
        %  <compute>(PrologIn, PrologOut),		% application body
        prolog_to_json(WUVData, WUVDataJSON),
        reply_json(WUVDataJSON).



topos_response([element(locations,[],[])],element(locations,[],Locations)) :-
	findall(element(location,[label=Label,id=ID,lat=Lat,long=Lng],[]),
		has_location(literal(lang(_,Label)),ID,literal(type(_,Lat)),literal(type(_,Lng))),
		Locations).



topos_response([element(location,LocationAttrs,[])],element(location_linked_data,[id=LID],
							    [element(stories,[count=Count],StoriesXML),
							     element(nodes,[],[Node|CalaisNodes])])) :-
	member(id=LID,LocationAttrs),
	location_query(LID,Result),
	query_articles(Result,[story(_,Stories,Count)]),
	(   member(linked_data_deref_mode=true,LocationAttrs) -> DerefMode = true ; DerefMode = false),
	(   member(open_calais_mode=true,LocationAttrs) -> OCMode = true ; OCMode = false),
	(   member(visualisation_mode=VisualMode,LocationAttrs) ; VisualMode = triple),

	debug(debug,'stories ~w',Stories),
	retractall(location_story_body(LID,_)),
	findall(element(story,[],XML),
		(   member(Story,Stories),story_XML(LID,Story,XML)),
		    StoriesXML),
	atom_concat('http://www.semanticweb.gr/topos/',LID,Ont),
	(   visited(location_ontology(LID,Ont)),! ;
	    assert(ontology(Ont)),nb_setval(current_ontology,Ont),
	    assert(visited(location_ontology(LID,Ont)))
	),
	(OCMode = true, not(visited(location_oc(LID))),
	 findall(B,location_story_body(LID,B),Bodies),
	 atomic_list_concat(Bodies,AllBodies),
	 oc_rest(text(AllBodies),'',_) ,
	 assert(visited(location_oc(LID))),
	 debug(debug,'OC response processing completed',[])
	;
	true
	),
	retractall(expanded_node(_)),
	individual_graph(LID,LID,DerefMode,VisualMode,[Node]),
	( OCMode = true ->
	  findall(Node1,
		(   ontologyAxiom(Ont,classAssertion(C,OCID)),
		    is_entailed(subClassOf(C,'http://s.opencalais.com/1/type/em/e/MarkupEntity'),_),
		    % oc_entity(OCID,C,_,_,_),
		    debug(graph,'oc individual ~w class ~w',[OCID,C]),
		    individual_graph(LID,OCID,DerefMode,VisualMode,[Node1])
		),
		CalaisNodes) ,
	  debug(graph,'OC individual graph completed',[])
	; true),
	debug(debug,'location response completed',[]).



t(LID,LDMode,OCMode,VisualMode) :-
	topos_response([element(location,[id=LID,
					  linked_data_deref_mode=LDMode,
					 open_calais_mode=OCMode,
					 visualisation_mode=VisualMode],[])], X),
	open('location_response.xml',write,Log,[encoding(utf8)]),stream_property(Log,encoding(utf8)),
	xml_write(Log,[X],[header(true),layout(true)]),close(Log).


individual_graph(LID,ID,DerefMode,VisualMode,[element(node,[type=IndType,id=IDGA],Arcs)]) :-
	not(expanded_node(ID)),
	aggregate_all(count,expanded_node(_),CC),
	CC < 300,
	debug(graph,'[graph for ~w',[ID]),


	(   VisualMode = triple -> IndType = individual ;
	(   person(ID) -> IndType = 'oce:Person' ;
	    findall(Class,(classAssertion(C,ID),Type='rdf:type',
			   rdf_global_id(C1,C)   ,term_to_atom(C1,Class)),IndType))
	),
	IndType \= [], % only individuals IDs with a classAssertion can generate node element
	assert(expanded_node(ID)),
	debug(graph,'expanded_count ~w',[CC]),

	rdf_global_id(IDG,ID),term_to_atom(IDG,IDGA),
	findall(element(arc,[type=Type],Node),
		(   VisualMode = triple,classAssertion(C,ID),Type='rdf:type',
		    rdf_global_id(C1,C),term_to_atom(C1,Class),Node = [element(node,[type='class',id=Class],[])];
		(   propertyAssertion(P,ID,V),Pmode=direct;propertyAssertion(P,V,ID),Pmode=reverse),
		    rdf_global_id(P1,P),
		    not(blocked_property(P1)),
		    term_to_atom(P1,Type1),
		    (	Pmode=reverse -> term_to_atom(inverse(Type1),Type) ; Type = Type1),
		    debug(graph,'property assertion ~w ~w',[ID,V]),
		    value_to_node(LID,V,DerefMode,VisualMode,Node)
		    ;
		sameAs(ID,ID1),dereferencable(LID,ID1,DerefMode),Type='owl:sameAs',
		    individual_graph(LID,ID1,DerefMode,VisualMode,Node)
		)
	       ,Arcs),
	debug(graph,'graph for ~w]',[ID]).

dereferencable(LID,ID,true) :-
	visited(location_ld(LID,ID)),!.


dereferencable(LID,ID,true) :-
	debug(debug,'Dereferncable ID ~w', ID),
	(   atom_concat('http://dbpedia.org/resource/',Resource,ID),
	concat_atom(['http://dbpedia.org/data/',Resource,'.rdf'],DataLink);
	    atom_concat('http://sws.geonames.org/',Resource,ID),
	    concat_atom(['http://sws.geonames.org/',Resource,'about.rdf'],DataLink)
	),!,
	debug(debug,'Dereferncable Datalink ~w', DataLink),
	time(owl_parse(DataLink,complete,false,false)),
	forall(rdf(A,B,C),debug(debug,'~w ~w ~w',[A,B,C])),
	assert(visited(location_ld(LID,ID))),!.

dereferencable(_,_,_).

blocked_property(ontology:wikipediaArticle).
blocked_property(ontology:alternateName).
blocked_property(core:inScheme).
blocked_property(nyt:mapping_strategy).
blocked_property(cc:license).
blocked_property(c:docId).
blocked_property(c:subject).

value_to_node(_LID,literal(lang(_,V)),_DerefMode,_VisualMode,[V]) :- !.
value_to_node(_LID,literal(type(_,V)),_DerefMode,_VisualMode,[V]) :- !.
value_to_node(_LID,literal(V),_DerefMode,_VisualMode,[V]) :- !.
value_to_node(_LID,lang(_,V), _DerefMode,_VisualMode,[V]) :- !.
value_to_node(LID,ID,_DerefMode,VisualMode,Node) :-
	individual_graph(LID,ID,false,VisualMode,Node),!.
value_to_node(_LID,ID,_DerefMode,_VisualMode,[ID]).


sameAs(I,S) :-
	sameIndividual(L),list_to_set(L,Ls),
	select(I,Ls,L1),
	member(S,L1).


% ToDO
% 1. Collect all axioms for a given individual
%    classAssertion, propertyAssertion, sameAS --> OK
% 2. For specific sameAs (dbpedia, geonames???) load the linked data
% (dereference) --> OK
%     Carefull to load the linked data in a separate 'Ontology', so they
%     can be discarded later. --> OK
% 3. For each body of stories for this location, call open calais and
% get linked data and entities. --> Halfway there
% 4. Show all the collected RDFs in FlexViz? --> OK
% 5. Do some reasoning
%     5.1 Get all classAssertions entailed for given individual
%     5.2 Get all propertyAssertions entailed for given individual
%     5.3 Get what is missing for given individual I:
%	  all missing propertyAssertions(P,I,?V) for propertyDomain(P,D)
%	  where D is in a classAssertion(D,I) for I
%     5.4 Custom rules: if born in location then
%	  nationality is country of location.


                 /*******************************
		 *	     REASONING	        *
		 *******************************/

nationality(Person,Nationality) :-
	propertyAssertion('http://dbpedia.org/ontology/birthPlace',Person,City),
	sameAs(City,City1),
	propertyAssertion('http://www.geonames.org/ontology#inCountry',City1,Nationality).

type_of(ID,Type) :-
	propertyDomain(P, Type),
	propertyAssertion(P,ID,_).

person(ID) :-
	propertyAssertion('http://dbpedia.org/ontology/birthPlace',ID,_).

                 /*******************************
		 *	     LOADING	        *
		 *******************************/


rdfs_property :-
	forall((test_use_owl(P,
		    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
		    'http://www.w3.org/1999/02/22-rdf-syntax-ns#Property'),
		propertyRange(P,R),(class(R)-> T=objectProperty(P); T=dataProperty(P))),
	       (   use_owl(P,
			   'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
			   'http://www.w3.org/1999/02/22-rdf-syntax-ns#Property',T),
		   assert_axiom(T))).


              /*******************************
		 * DCG FOR TEMIS Service RESULTS   *
	       *******************************/

temis_dcg(UVIndex) -->
	{debug(http_server,'temis in dcg ~w',UVIndex)},
	[_|_], "The results appear below", [_|_], "<table",
	dcg_table(UVIndex),
	"</table>", [_|_].

dcg_table(UVIndex) -->
	[_|_], temis_dcg_trs(UVIndex), ws.


temis_dcg_trs([uvindex(Day,noon,Value)|Rest]) -->
	"<tr>",ws,
	dcg_temis_date(Day),ws,dcg_temis_uv(Value), ws, dcg_td(_),
	ws, "</tr>", ws,
	temis_dcg_trs(Rest).
temis_dcg_trs([]) --> [].

dcg_td(TD) -->
	"<td", [_|_], ">", [T|D],
	{atom_codes(TD,[T|D])},
	"</td>".

dcg_temis_uv(Value) -->
	"<td", [_|_], ">", ws,numeric_literal(Value), ws,
	"</td>".


dcg_temis_date(Date) -->
	"<td", [_|_], ">", [_|_], date(Date), ws,
	"</td>".

:- json_object uvindex(date, time, uvalue).
:- json_object geolocation(long,lat).


