# Localize.To React Client

This module allows you to get and use localization strings from [Localize.to](https://localize.to) service.

## Localize.To REST API

- GET /language/{language}
- GET /languages/{language1,language2}

- GET /snapshots
- GET /snapshot/latest/info
- GET /snapshot/latest
- GET /snapshot/{version}
- GET /snapshot/{version}/language/{language}
- GET /snapshot/{version}/languages/{language1,language2}

## Currently, this module implements only these API calls:

- GET /languages/{language1,language2}
- GET /snapshot/{version}
- GET /snapshot/{version}/languages/{language1,language2}

this is enough for the most cases.

## Installation

```shell
yarn add localize-to
```

```shell
npm i localize-to --save
```

## Demo project

Demo project could be found there:
[Localize.to Demo Project](https://github.com/whitetown/localize-to-react-example)


## Usage

localize-to exports several components/functions:

- LocalizeToProvider      //provider, wrap an app in the provider
- useLocalizeTo           //custom hook, use it with functional components
- withLocalizeTo          //wrap a class or a component to provide access to localizedContext
- LocalizeToContext       //context, usually you do not access it directly
- LocalizeToConsumer      //consumer, usually you do not need it as well


## Wrap your application in LocalizeToProvider

```jsx
import { LocalizeToProvider } from 'localize-to';

const initialTranslations = {
    en: {
        key: "value_english",
        /* and so on */
    },
    de: {
        key: "value_german",
        /* and so on */
    },
}

const LocalizedApp = () => {
    return (
        <LocalizeToProvider
            language={'en'}  //by default "en"
            fallbackLanguage={'en'}  //could be null, by default "en"
            translations={initialTranslations}  //object
            apiKey={PROJECT_API_KEY}    //string
        >
            <App />
        </LocalizeToProvider>
    )
}

export default LocalizedApp;
```

## Get localization strings

```jsx
import { useLocalizeTo } from 'localize-to'

const MyComponent = () => {

    const { ls, localize, localizeTo, translations } = useLocalizeTo()

    return (
        <div>
            {localize('key')}
            {localizeTo('key', 'de')}
            {ls['key']}
            {ls.key}
            {translations['en']['key']}
        </div>
    )
}
```

**localize(key)**
returns a translation for current language or a key if a translation does not exist

**localizeTo(key, language)**
returns a translation for particular language or a key if a translation does not exist

**ls**
is an object that contains translations for current language

**translations**
is an object that contains translations for all languages

**localize, localizeTo, ls** also can return a translation for the fallback language


## Special unlocalized function

```jsx
import { useLocalizeTo } from 'localize-to'

const NewComponent = () => {

    const { unlocalized } = useLocalizeTo()

    return (
        <div>
        {unlocalized('localization key or any string')}
        </div>
    )
}
```

It does nothing.
Use it when you do not know localization keys yet and then you can easily find all of them in your project.

## Set current and/or fallback language

```jsx
import { useLocalizeTo } from 'localize-to'

const LanguageSelect = () => {

    const { language, setLanguage, fallbackLanguage, setFallbackLanguage } = useLocalizeTo()

    return (
        <div>
            <div>Current {language}, Fallback: {fallbackLanguage}</div>
            <button onClick={()=>setLanguage('fr')}>
                Switch to French
            </button>
            <button onClick={()=>setFallbackLanguage('en')}>
                Set English as a fallback language
            </button>
        </div>
    )
}

export default LanguageSelect
```

## Download new localization strings from the service

There are several functions:

**downloadLanguage(language, callback)**
Get localized strings for particular language

**downloadLanguages([language1, language2], callback)**
Get localized strings for particular languages

**downloadLanguages([], callback)**
Get localized strings for all available languages

**downloadVersion(version, [language1, ...], callback)**
Get localized strings for particular version and/or languages

callback is optional, it returns an error or null


```jsx
import { useLocalizeTo } from 'localize-to'

const Downloads = () => {

    const { localizeIsLoading, downloadLanguage, downloadLanguages, downloadVersion } = useLocalizeTo()

    return (
        <div>
            <div>
                {localizeIsLoading ? 'Loading...' : null}
            </div>
            <button onClick={()=>downloadLanguage('sk')}>
                Get [SK]
            </button>
            <button onClick={()=>downloadLanguages(['pl', 'de'])}>
                Get [PL, DE]
            </button>
            <button onClick={()=>downloadLanguages([])}>
                Get [All languages]
            </button>
            <button onClick={()=>downloadVersion('v1.0.1', ['uk'])}>
                Get v1.0.1 [UK]
            </button>
            <button onClick={()=>downloadVersion('v1.0.1')}>
                Get v1.0.1 [All languages]
            </button>
        </div>
    )
}

export default Downloads
```

## withLocalizeTo

If you prefer not to use hooks, you can wrap your components or classes in withLocalizeTo function.


```jsx
import { withLocalizeTo } from 'localize-to'

class Welcome extends React.Component {

    render() {

        // ls is an object with localized strings for current language
        // ls is a localizedContext
        const { ls, lc } = this.props

        // lc prop contains properties and functions described above
        const { language, fallbackLanguage, setLanguage, ...rest } = lc

        return (
            <div>
                <div>{lc.localize('welcome')}</div>
                <div>{ls['welcome']}</div>
                <div>{ls.welcome}</div>
                <div>{lc.localizeTo('welcome', 'de')}</div>
            </div>
        )
    }
}

export default withLocalizeTo(Welcome)
```
