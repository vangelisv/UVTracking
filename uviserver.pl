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



has_location(PrefLabel,ID,Lat,Long) :-
	rdf_global_id(geo:long,LongP),propertyAssertion(LongP,ID,Long),
	rdf_global_id(geo:lat,LatP),propertyAssertion(LatP,ID,Lat),
	rdf_global_id(core:prefLabel,LabelP),propertyAssertion(LabelP,ID,PrefLabel).

location_query(L,Result) :- visited(location_query(L,Result)),!.
location_query(L,Result) :-
	rdf_global_id(nyt:search_api_query,P),
	propertyAssertion(P,L,literal(type(_,Q))),
	atom_concat( Q,'&api-key=7f2fea2a303d72a5f65046d832e9836c:4:60280314',Q1),
	http_get(Q1,Result,[]),
	assert(visited(location_query(L,Result))).


query_articles(Query,Articles) :-
	atom_codes(Query,Codes),phrase(location_stories(Articles),Codes,_).

location_articles(L,Bodies) :-
	location_query(L,Result),query_articles(Result,[story(_,Articles,_Count)]),!,
	findall(Body,(member(Article,Articles),
		      (member(facet(abstract,Body),Article) ; member(facet(body,Body),Article))), Bodies).


% --------------------------------------------

get_and_parse_uvindex(Service, Long, Lat, UVIndex) :-
	nb_setval(dcg_mode,p),
	service_description(Service,Long,Lat,HTTPQuery,Grammar),
	http_get(HTTPQuery,R,[]),
	atom_codes(R,Codes),
	Term =.. [Grammar,UVIndex],
	phrase(Term,Codes,_Rest).

service_description(temis, Long,Lat, HTTPQuery, temis_dcg) :-
       atomic_list_concat(['http://www.temis.nl/uvradiation/nrt/uvindex.php?lon=',Long,'&lat=',Lat],HTTPQuery).



go(UVIndex) :-
	nb_setval(dcg_mode,p),
	get_and_parse_uvindex(temis, 23.078, 50.57, UVIndex).

test_service(Long,Lat) :-
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
	get_and_parse_uvindex(temis,Lat,Long,[_|UVIndex]),
	debug(http_server,'temis parsed uvindex ~w',UVIndex),
        %  <compute>(PrologIn, PrologOut),		% application body
        prolog_to_json(UVIndex, JSONOut),
        reply_json(JSONOut).


topos_http_reply(Request) :-
	format('Content-type: text/xml\r\n\r\n'),
	member(input(StIn),Request),
	member(peer(_Peer),Request),
	member(path(Path),Request),
	debug(http_server,'request ~w',Request),
	% open('topos_http.log',append,Log),write(Log,Request),nl(Log),
	(   Path = '/crossdomain.xml',!,
	    xml_write(element('cross-domain-policy',[],[element(allow-access-from,[domain='*'],[])]),[])
	;
	     set_stream(StIn,timeout(0)),
	    debug(http_server,'before load structure ~w',Request),
	     load_structure(StIn, RequestXML,[dialect(xml),space(sgml)]),
	    debug(http_server,'after load structure ~w',Request)
	),
	% write(Log,RequestXML),nl(Log),
	catch(
	      (	  topos_response(RequestXML,Result),
		  % write(Log,Result),
		  xml_write([Result],[header(true),layout(true)])),
		  % xml_write(Log,[Result],[header(true),layout(true)]),nl(Log))
	      Message,
	      Result=element(error,[],[Message])),
	debug(http_server,'after topos response processing result:~w',[Result]).
	% close(Log).


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


story_XML(LID,Facets,XML) :-
	findall(Element1,
		(   member(facet(Name,Value),Facets),
		    facet_element(LID,Name,Value,Element),
		    member(Element1,Element)),
		XML).

facet_element(LID,Name,[H|T],[element(Name,[],Elements)]) :-
	findall(element(MultimediaName,[],X),
		(   member(facet(MultimediaName,MultimediaValue),[H|T]),
		    facet_element(LID,MultimediaName,MultimediaValue,X)),
		Elements),!.

facet_element(_LID,Name,[H|T],Elements) :-
	      findall(element(Name,[],[Value]),
		      member(Value,[H|T]),
		      Elements),!.

facet_element(LID,Name,Value,[element(Name,[],[Value])]) :-
	Name = body,
	visited(location_story_body(LID,Value,_)),!.

facet_element(LID,Name,Value,[element(Name,[],[Value])]) :-
	Name = body,!,
	assert(location_story_body(LID,Value)).


facet_element(_LID,Name,Value,[element(Name,[],[Value])]).




clear_location(LID) :-
	retractall(visited(location_query(LID,_))),
	(   visited(location_ontology(LID,Ont)),
	    retractall(ontology(Ont)),
	    forall(ontologyAxiom(Ont,Axiom),retract(Axiom)),
	    retractall(ontologyAxiom(Ont,_))
	; true),
	retractall(visited(location_ontology(LID,_))),
	retractall(visited(location_oc(LID))),
	retractall(visited(location_ld(LID,_))).


t(LID,LDMode,OCMode,VisualMode) :-
	topos_response([element(location,[id=LID,
					  linked_data_deref_mode=LDMode,
					 open_calais_mode=OCMode,
					 visualisation_mode=VisualMode],[])], X),
	open('location_response.xml',write,Log,[encoding(utf8)]),stream_property(Log,encoding(utf8)),
	xml_write(Log,[X],[header(true),layout(true)]),close(Log).

istanbul :-
	t('http://data.nytimes.com/N2952224495637104151',true,true,concept).

acapulco :- t('http://data.nytimes.com/N90697374154619704121',true,true,concept).

paris :- t('http://data.nytimes.com/N38451885616396959731',true,false,concept).


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


%% nyt_elements is det
%
% Asserts adhoc Ontology axioms (dataProperty) to compensate for missing
% Ontology declarations.

nyt_elements :-
	assert_axiom(dataProperty('http://data.nytimes.com/elements/first_use')),
	assert_axiom(dataProperty('http://data.nytimes.com/elements/latest_use')),
	assert_axiom(dataProperty('http://data.nytimes.com/elements/number_of_variants')),
	assert_axiom(dataProperty('http://data.nytimes.com/elements/associated_article_count')),
	assert_axiom(dataProperty('http://data.nytimes.com/elements/search_api_query')),
	assert_axiom(dataProperty('http://data.nytimes.com/elements/mapping_strategy')),
	assert_axiom(dataProperty('http://data.nytimes.com/elements/topicPage')),
	assert_axiom(dataProperty('http://xmlns.com/foaf/0.1/primaryTopic')),
	assert_axiom(dataProperty('http://www.w3.org/2003/01/geo/wgs84_pos#long')),
	assert_axiom(dataProperty('http://www.w3.org/2003/01/geo/wgs84_pos#lat')),
	assert_axiom(dataProperty('http://purl.org/dc/elements/1.1/creator')).


%% load_nyt_locations is det
%
% Loads (from local urls at the moment) needed Ontologies (TBoxes) and
% NYT data Locations
%


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
	dcg_td(Day),ws,dcg_td(Value), ws, dcg_td(_),
	ws, "</tr>", ws,
	temis_dcg_trs(Rest).
temis_dcg_trs([]) --> [].

dcg_td(TD) -->
	"<td", [_|_], ">", [T|D],
	{atom_codes(TD,[T|D])},
	"</td>".

:- json_object uvindex(date, time, uvalue).
:- json_object geolocation(long,lat).
