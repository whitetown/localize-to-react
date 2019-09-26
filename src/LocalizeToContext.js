import React, { createContext, useState, useContext } from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'

import { GET } from './LocalizeToAPI'

const LocalizeToContext = createContext({})

function createTranslations( translations, language, fallbackLanguage ) {
    const result = Object.assign(
            {},
            fallbackLanguage ? translations[fallbackLanguage]||{} : {},
            translations[language],
            )
    return result
}

const LocalizeToProvider = props => {

    const {
        language:         initialLanguage,
        fallbackLanguage: initialFallbackLanguage,
        translations:     initialTranslations,
        apiKey,
        children
    } = props

    const [language, setLanguageInternal] = useState(initialLanguage||'en')
    const [fallbackLanguage, setFallbackLanguageInternal] = useState(initialFallbackLanguage)
    const [translations, setTranslationsInternal] = useState(initialTranslations||{})
    const [ls, setLS] = useState(createTranslations(initialTranslations||{}, initialLanguage||'en', initialFallbackLanguage))
    const [localizeIsLoading, setLocalizeIsLoading] = useState(false)

    const setLanguage = language => {
        setLanguageInternal(language)
        setLS(createTranslations(translations||{}, language||'en', fallbackLanguage))
    }

    const setFallbackLanguage = fallbackLanguage => {
        setFallbackLanguageInternal(fallbackLanguage)
        setLS(createTranslations(translations||{}, language||'en', fallbackLanguage))
    }

    const unlocalized = (key) => {
        // if (process.env.NODE_ENV === 'production') {
        //     console.warn('Unlocalized key [' + key + '] in production')
        // }
        return key
    }

    const localize = (key) => {
        return ls[key]||key
    }

    const localizeTo = (key, language = null) => {
        return language ? (translations[language]||{})[key]||key : localize(key)
    }

    const downloadURL = (languages) => {
        return languages && languages.length
            ? '/v1/languages/' + languages.join(',') + '?apikey=' + apiKey
            : '/v1/languages'  + '?apikey=' + apiKey
    }

    const snapshotURL = (version, languages) => {
        return languages && languages.length
            ? '/v1/snapshot/' + version + '/languages/' + languages.join(',') + '?apikey=' + apiKey
            : '/v1/snapshot/' + version + '?apikey=' + apiKey
    }

    const downloadLanguages = (languages, callback = (error)=>{}) => {
        if (!apiKey) {
            callback('API key is required')
            return
        }

        setLocalizeIsLoading(true)
        GET(downloadURL(languages),
            (data) => {

                if (data.error) {
                    setLocalizeIsLoading(false)
                } else {
                    const updatedTranslations = {
                        ...translations,
                        ...data,
                    }
                    ReactDOM.unstable_batchedUpdates(() => {
                        setLocalizeIsLoading(false)
                        setTranslationsInternal(updatedTranslations)
                        setLS(createTranslations(updatedTranslations, language||'en', fallbackLanguage))
                    })
                }
                callback(data.error)
            },
            (error) => {
                setLocalizeIsLoading(false)
                callback(error)
            }
        )
    }

    const downloadLanguage = (language, callback) => {
        if (!language) {
            callback('Language is required')
            return
        }
        downloadLanguages([language], callback)
    }

    const downloadVersion = (version, languages = [], callback = (error)=>{}) => {
        if (!apiKey) {
            callback('API key is required')
            return
        }

        setLocalizeIsLoading(true)
        GET(snapshotURL(version, languages),
            (data) => {

                if (data.error) {
                    setLocalizeIsLoading(false)
                } else {
                    const keys = languages && languages.length ? languages : Object.keys(data)
                    let updatedTranslations = { ...translations }
                    keys.forEach( k => updatedTranslations[k] = data[k] )
                    ReactDOM.unstable_batchedUpdates(() => {
                        setLocalizeIsLoading(false)
                        setTranslationsInternal(updatedTranslations)
                        setLS(createTranslations(updatedTranslations, language||'en', fallbackLanguage))
                    })
                }
                callback(data.error)
            },
            (error) => {
                setLocalizeIsLoading(false)
                callback(error)
            }
        )
    }

    // console.log(translations)

    const result = {
        language, setLanguage,
        fallbackLanguage, setFallbackLanguage,
        translations,
        ls, localize, localizeTo, unlocalized,
        localizeIsLoading,
        downloadLanguage, downloadLanguages,
        downloadVersion,
    }

    return (
        <LocalizeToContext.Provider value={result}>
            {children}
        </LocalizeToContext.Provider>
    )
}

LocalizeToProvider.propTypes = {
    language:           PropTypes.string,
    fallbackLanguage:   PropTypes.string,
    translations:       PropTypes.object,
    apiKey:             PropTypes.string,
};

LocalizeToProvider.defaultProps = {
    language:         'en',
    fallbackLanguage: null,
    translations:     {},
    apiKey:           null,
}

const useLocalizeTo = () => {
    return useContext(LocalizeToContext)
}

const LocalizeToConsumer = LocalizeToContext.Consumer

const withLocalizeTo = InnerComponent => {
    return class LocalizeToComponent extends React.Component {
        render () {
            return (
                <LocalizeToConsumer>
                    {localizeContext => <InnerComponent lc={localizeContext} ls={localizeContext.ls} {...this.props} />}
                </LocalizeToConsumer>
            )
        }
    }
}

export {
    LocalizeToContext,
    LocalizeToProvider,
    LocalizeToConsumer,
    useLocalizeTo,
    withLocalizeTo,
}
