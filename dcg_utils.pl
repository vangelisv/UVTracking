% * -*- Mode: Prolog -*- */
% **********************************************************************
%				 DCG Utilities
%  Author: Vangelis  Vassiliadis
%  Change Log:
%
%
% **********************************************************************


:- module(dcg_utils,
	  [
	   identifier/3,
	   identifier_list/3,
	   string_literal/3,
	   real_literal/3,
	   integer_literal/3,
	   numeric_literal/3,
	   downcase/3,
	   ws/2,
	   indent/3,
	   space/3,
	   ws/3,
	   dcg_nl/2,
	   token/3,
	   parse_error/3,
	   remove_obj/3,
	   colon_to_underscore/2,
	   date_time/4,
	   date/3
	  ]).

/** <module> DCG utility predicates
  General comments here...
*/



identifier_list([H|T]) -->
	identifier(H), ws, ",", ws, identifier_list(T).

identifier_list([H]) --> identifier(H),!.

% identifier_list([]) --> [].

identifier(ID) -->
	{(nonvar(ID)->atom_codes(ID,[L|R]);true)},
	identifier_letter(L),
	underline_letter_or_digit(R),
	{(var(ID)->atom_codes(ID,[L|R]);true)},!.

identifier_letter(L) -->
	[L], {code_type(L,lower) -> true ; code_type(L,upper)}.

underline_letter_or_digit([H|R]) -->
	(   identifier_letter(H) ; digit(H) ; "_", {H=95} ),
	underline_letter_or_digit(R).

underline_letter_or_digit([]) --> "".


digit(H) -->
	[H], {code_type(H,digit)}.

upcase(U) -->
	identifier(ID) , { upcase_atom(ID,U)}.


downcase(D) -->
	{nb_current(dcg_mode,p)},!,
	identifier(ID),{downcase_atom(ID,D)}.

downcase(D) -->
	{atom_codes(D,[D|C])}, [D|C].


string_literal(S) -->
	[34], string_elements(S), [34].

string_elements([H|T]) -->
	string_element(H),string_elements(T).
string_elements([]) --> "".

string_element(D) --> [D], {D \= 34}.
string_element([34,34]) --> [34,34].

numeric_literal(Number) -->
	integer_literal(Number);real_literal(Number).



integer_literal(I) --> decimal_integer_literal(I).

decimal_integer_literal(I) -->
	numeral(CI1),!,{number_chars(I1,CI1)},
	(   positive_exponent(E),{I is I1 * 10 ** E},! ; {I = I1} ).

real_literal(R) --> decimal_real_literal(R).

decimal_real_literal(R) -->
	numeral(CI), ".", numeral(CD),
	{number_chars(I,CI), number_chars(D,[48,46|CD]),R1 is I + D },
	(   exponent(E),! ; {E = 0}),
	{R is R1 * 10 ** E}.


numeral([H|T]) -->
	digit(H),digits(T).

digits([H|T]) -->
	digit(H), !, digits(T).
digits([]) --> "".

positive_exponent(E) -->
	"E", ("+",!;{true}), numeral(EN),{number_chars(E,EN)}.

exponent(E) -->
	positive_exponent(E), ! ;
	"E", "-", numeral(E1), {EN = [45|E1],number_chars(E,EN)}.


ws --> {nb_current(dcg_mode,p)},
	"--", [_|_] , [E], {nonvar(E),code_type(E,end_of_line)},!,
	ws.

ws -->  {nb_current(dcg_mode,p)},
	[D], {nonvar(D),code_type(D,space)},!,
	ws.

ws --> {nb_current(dcg_mode,p)},"",!.

ws --> ws(1).

ws(_) --> {nb_current(dcg_mode,p)},!, ws.

ws(N) --> space(N).


dcg_nl -->
	{nb_current(dcg_mode,p)},!,ws.

dcg_nl -->
	[10].


space(_) -->
	{nb_current(dcg_mode,p)},!,ws.

space(N) --> {make_indent(N,[L|L1])},[L|L1].


indent(_) -->
	{nb_current(dcg_mode,p)},!,ws.

indent(N) --> [10],{make_indent(N,[L|L1])},[L|L1].


make_indent(0,[]) :- !.
make_indent(N,[32|T]) :-
	N1 is N - 1,
	make_indent(N1,T).


token(Token) -->
	{atom(Token)},downcase(Token).

token(Token,In,Out) :-
	atom(Token), !,atom_codes(Token,TokenCodes),
	token(TokenCodes,In,Out).


token(Token,In,Out) :-
	append(Token,Out,In),!.


token(Token,In,_Out) :-
	string_to_list(StrIn,In),
        sub_string(StrIn,0,300,_,StrStart),

	atom_codes(In1,StrStart),
	atom_codes(Token1,Token),
	throw(token(Token1,expected, found(In1))).

parse_error(Error,In,_Out) :-
	string_to_list(StrIn,In),
	sub_string(StrIn,0,300,_,Start),atom_codes(ErrorContext,Start),
	throw(parse_error(Error,ErrorContext)).

% -------------------------------
%

remove_obj(type_impl(P:T,I),type_impl(P:T1,I),Obj) :-
	!, remove_obj(T,T1,Obj).

remove_obj(In,Out,Obj) :-
	(   atom(In) ->
	atom_codes(In,InCodes),
	    phrase(remove_obj(Out,Obj),InCodes,[]),! ;
	Out = In).


remove_obj(Out,Obj) -->
	[P|Refix], Obj, numeral(_), [],
	{atom_codes(Out,[P|Refix])}.


remove_obj(Out,Obj) -->
	[P|Refix], Obj, numeral(_), [S|Uffix],
	{append([P|Refix],[S|Uffix],L),atom_codes(Out,L)}.

remove_obj(Any,_) -->
	[H|T], {atom_codes(Any,[H|T])}.

% -------------------------------
%
colon_to_underscore(Colon,U) :-
	atom_codes(Colon,ColonCodes),
	phrase(colon_to_underscore(UC),ColonCodes,[]),!,
	atom_codes(U,UC).

colon_to_underscore(U) -->
	[H|T], "::", colon_to_underscore(R),
	{append([H|T],[95|R],U)}.

colon_to_underscore([H|T]) --> [H|T].

% -------------------------------
%


date_time(Date,Time) -->
	date(Date),ws,
	[T|Ime],
	{atom_codes(Time,[T|Ime])}.

date(Date) -->
	identifier(DoW),", ",
	numeric_literal(Day),[32],
	identifier(Month),[32],
	numeric_literal(Year),
	{atomic_list_concat([DoW,', ',Day,' ',Month,' ',Year],Date)}.

date(Date) -->
	numeric_literal(Day),[32],
	identifier(Month),[32],
	numeric_literal(Year),
	{atomic_list_concat([Day,' ',Month,' ',Year],Date)}.
