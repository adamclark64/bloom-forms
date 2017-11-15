# Bloom Forms

#### All your form functionality in one place.

Features:
- Fully accessible, responsive and custom-stylable inputs.
- Integrates seamlessly with bloom-starter.
- All form actions available through redux.
- Fully customizable validation. Works through form.jsx and independently.

Includes:

* Redux:
    - formActions.js
    - formReducer.js

* Components:
    - Form (form wrapper)
    - ErrorTip (default inline form errors)
    - form inputs
      * Button
      * Checkbox
      * CurrencyInput
      * Dropzone
      * FileInput
      * RadioGroup
      * SelectInput
      * TextArea (bigger, multi-line, like `<textarea>`)
      * TextInput
      * ToggleSwitch

## README Contents:
### General:
- [Usage](https://github.com/vineyard-bloom/bloom-forms#usage)
- [Set Up](https://github.com/vineyard-bloom/bloom-forms#set-up)
- [Contributing](https://github.com/vineyard-bloom/bloom-forms#contributing)

### Form Usage:
- [Required Props](https://github.com/vineyard-bloom/bloom-forms#required-props)
- [Optional Props](https://github.com/vineyard-bloom/bloom-forms#optional-props)
- [Updating Form State](https://github.com/vineyard-bloom/bloom-forms#updating-form-state)
- [Validation](https://github.com/vineyard-bloom/bloom-forms#validation)
- [Prepopulating Form](https://github.com/vineyard-bloom/bloom-forms#prepopulating-form)
- [Submitting Forms](https://github.com/vineyard-bloom/bloom-forms#submitting-forms)
- [Forms with Switch Inside](https://github.com/vineyard-bloom/bloom-forms#forms-with-switch-inside)

### Children
- [Form Children Props](https://github.com/vineyard-bloom/bloom-forms#form-children-props)
- [Specific Inputs](https://github.com/vineyard-bloom/bloom-forms/blob/master/docs/inputs.md)

## Usage
To use this package, you can install with either npm or yarn.
```
npm install bloom-forms --save
```
or
```
yarn add bloom-forms
```

To import one of the files/components in this package, import like:
```
import { formReducer } from 'bloom-forms';
```

## Contributing
Fork this repo, run `yarn test` and ensure everything passes, then bundle with `yarn build`. Accepted PRs will be merged and published to npm.

## Set Up
- Every form needs two files: a container and a presentation component (with all the inputs inside it)
- The container should render the presentation component wrapped inside of the generic Form.jsx container. This wrapper handles all your state, updating redux, errors, etc.
- Example:
A login form might look like this: (simplified -- make sure all your inputs have required props, etc.)
```
const LoginForm = (props) => {
  return (
    <form id='login-form'>
      <TextInput name='username' value={ formData.username } />
      <TextInput name='password' isPassword={ true } value={ formData.password.value } onBlur={ props.checkField } />
      <Button text='submit' onClick={ props.submitForm } />
    </form>
  )
}
```
And its container would look like this:
```
class LoginFormContainer extends React.Component {
  submitForm = (formData, files, successCallback, failCallback) => {
    WebService.login(formData)
      .then(res => {
        successCallback()
      })
      .catch(err => {
        failCallback()
      })
  }

  render() {
    let fieldNames = ['username', 'password']
  
    return (
      <Form id='login-form' fieldNames={ fieldNames } submitForm={ this.submitForm }>
        <LoginForm />
      </Form>
    )
  }
}
```
- Note that the IDs match ('login-form'), and the fieldNames match the names of the TextInputs.

[Back to Contents](https://github.com/vineyard-bloom/bloom-forms#readme-contents)

## Required Props
### Field Names
`fieldNames` is a required prop when using form.jsx. It uses this array to know which fields to track. Each entry in fieldNames can be a string, like `'firstName'`, or an object with a type and name, like `{ name: 'isFullTimeEmployee', type: 'checkbox' }`. It's recommended to use the second version for checkboxes and radios.
### Submit Form
`submitForm` must be a function that receives the formData, file data, and two callbacks (success and fail). See 'Submitting Forms' below.
### Id
`id` is just the id of your form. You should make your jsx component `<form id>` match.

[Back to Contents](https://github.com/vineyard-bloom/bloom-forms#readme-contents)

## Optional Props
### Validation Help
Used to customize bloom-form's built-in validation. See 'Validation' below.
### Ignore Focus On First Element
By default the first element will be focused on.  Set this prop to false to offset default behavior
### Preserve After Unmount
By default, the form will clear its data after unmounting from the ui. This means that a registration form will delete its data after you route to a new page. If `preserveAfterUnmount` is true, this will prevent the form from clearing, and you'll be able to return to that form and see the data still there.
### Prepopulate Data
`prepopulateData` is a json object, usually return from an ajax GET request, that fills in the fields in your form. The keys in this json object should match up with the fieldNames you passed into the form.

[Back to Contents](https://github.com/vineyard-bloom/bloom-forms#readme-contents)

## Updating Form State
By default, inputs' values are updated via the `updateForm` method. It receives the event coming from changing that input and sets that field's value for you. You can stick it right on an input like:
```
<TextInput onChange={ this.props.updateForm } />
```

You can also manually update a field. Say you have a button that changes the value of a text input. You would want to manually pass in which values and which fields are needed. You can do this through `manualFieldUpdate`, which accepts four parameters: the formId, the fieldName, the fieldValue, and the type of input (html5 standard input types preferred, such as 'text', 'checkbox', and 'radio'). To use:
```
const { formData, formId, manualFieldUpdate } = this.props

...

    <Button onClick={ () => manualFieldUpdate(formId, 'choice', 'Choice #1 - Blah', 'text') }>
      Choice #1
    </Button>
    <TextInput name='choice' value={ formData.choice.value } />

...
```

[Back to Contents](https://github.com/vineyard-bloom/bloom-forms#readme-contents)

## Validation
All the existing inputs have support for a `validateAs` string and an `onBlur` (when that field loses focus) function prop, which should call `props.checkField`. You can add more types of validaton to the validator by passing in a `validationHelp` prop to `<Form />`.

`validationHelp` should be an object with two fields: a json object of error messages, and a dictionary of custom `validateAs` keys with their test functions that return errors.
- Example:
```
validationHelp = {
  errorLanguage: {
    'not-empty': 'This field cannot be empty',
    'min-length': 'This field must be at least <LIMIT> chars.'
  },
  dictionary: {
    'min-length-2': (testData) => testData.length && testData.length >= 2 ? null : errorLanguage['min-length'].replace('<LIMIT>', 2),
    'min-length-8': (testData) => testData.length && testData.length >= 8 ? null : errorLanguage['min-length'].replace('<LIMIT>', 8)
  }
}
```

To use this set up, an example field would look like:
```
<TextInput name='pet' validateAs='min-length-2' onBlur={ props.checkField } onChange={ props.updateForm }
  value={ formData.pet.value } error={ formData.pet.error } />
```

[Back to Contents](https://github.com/vineyard-bloom/bloom-forms#readme-contents)

## Prepopulating `<Form />`
To have your form populate with existing data, pass in a JSON object of key/value pairs where the keys match your fieldNames prop.

You may have to use an ajax call to grab the necessary data. Form.jsx will load those values as soon as it receives them.

## Submitting Forms
Form.jsx will handle your form data, but you should write your own submitForm function and pass it in as a prop. Your submitForm should be able to handle formData, a FormData object of files, and both a success and fail callback. You *must* call the success and fail callbacks for the form to update `pendingRequest` -- otherwise, anything showing loading/pending that's dependent on that field will continue to spin endlessly.

An example submitForm might look like:
```
submitForm = (formData, files, successCallback, failCallback) => {
  WebService.post(formData)
    .then((res) => {
      // trigger a success alert
      successCallback()
    })
    .catch((err) => {
      // trigger an error alert
      failCallback()
    })
}
```

[Back to Contents](https://github.com/vineyard-bloom/bloom-forms#readme-contents)

## Forms with Switch Inside
To make forms with Routes inside, you will need to make the Switch its own Container inside another form container and pass in the props with a spread operator.

For example:
Outermost container:
```
class RegistrationFormContainer extends React.Component {
  render() {
    return (
      <Form id='registration-form' fieldNames={ fieldNames } submitRoute='/user/register'>
        <RegistrationFormSwitch />
      </Form>
    )
  }
}
```
Switch container:
```
class RegistrationFormSwitch extends React.Component {
  render() {
    return (
      <Switch>
        <Route path='/step1' render={ () => <StepOne { ...this.props } /> } />
        <Route path='/step2' render={ () => <StepTwo { ...this.props } /> } />
      </Switch>
    )
  }
}
```
Now StepOne and StepTwo will both be able to receive their needed Form props, such as `updateForm` and `addFormError`.

[Back to Contents](https://github.com/vineyard-bloom/bloom-forms#readme-contents)

## Form Children Props
Whatever you stick inside of `<Form />` is wrapped in a variety of methods and props that are helpful to those children.

A complete list of these that are available via `this.props` are:
  - `addFormError`:
    A function that accepts the form id, the fieldName, and the error message.
    Used like
      ```
      this.props.addFormError('example-form', 'name', 'This field cannot be blank.');
      ```
  - `attemptedSubmit`:
    A boolean that indicates whether the user has already tried to submit the form. Useful in situations where you may want to run different checks depending on if they've submitted already or not.
  - `checkField`:
    A function that accepts a DOM event and an optional element if you don't want to use the DOM event target.
    Used like
    ```
    this.props.checkField(null, document.getElementById('example-field'))
    ```
    or
    ```
    this.props.checkField(e)
    ```
  - `deleteFormError`:
    A function that accepts the form id and the fieldName that has an error.
    Used like
    ```
    this.props.deleteFormError('example-form', 'name')
    ```
  - `formData`:
    An object that represents all the inputs inside your form. Corresponds to the object inside the redux store's `forms` object.
    An example formData object could look like:
      ```
        {
          'name': { value: 'Bob' },
          'phone': { value: '444-23', error: 'This field must be a valid phone number' }
        }
      ```
  - `formId`:
    The id of your Form. You should use this on your outermost
      ```
      <form id={this.props.formId}> ... </form>
      ```
  - `isValid`:
    A boolean that indicates whether all fields in your form have passed validation. Defaults to true.
  - `manualFieldUpdate`:
    See [Updating Form State](https://github.com/vineyard-bloom/bloom-forms#updating-form-state) above.
  - `prepopulated`:
    A boolean that indicates whether you've passed in saved data to populate the form.
  - `processingRequest`:
    A boolean indicating whether your form is submitting. Useful for loading animations and disabling buttons.
  - `updateForm`:
    See [Updating Form State](https://github.com/vineyard-bloom/bloom-forms#updating-form-state) above.
  - `submitForm`:
    An intermediary function that processes your form data before passing it along to your `submitForm` passed into `<Form />`.

[Back to Contents](https://github.com/vineyard-bloom/bloom-forms#readme-contents)

## NOTE ON Z-INDEX
To ensure that SelectInputs in rows above other SelectInputs render on top of them, their wrapping row div must have a higher z-index than the row below.

For example:
```
<div style={{ zIndex: 2 }} className='LoginForm-row'>
  <SelectInput />
</div>
<div style={{ zIndex: 1 }} className='LoginForm-row'>
  <SelectInput />
</div>
```

