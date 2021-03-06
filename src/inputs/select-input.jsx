import React from 'react'
import PropTypes from 'prop-types'

import ErrorTip from '../error-tip'
import Loading from './loading'
import '../styles/inputs.scss'
import '../styles/select-input.scss'

/* SUPPORTS:
  - typeahead
  - esc and arrow keys
  - tabbing
  - regular old onClick
*/

const compareLetters = (str1, str2) => {
  // finding out if the first part of comparison string (str2) matches the typeahead (str1)
  return str1
    ? str2.toLowerCase().slice(0, str1.length).split('').reduce((total, curr, index) => total && (curr === str1.toLowerCase()[index]))
    : true
}

class SelectInput extends React.Component {
  state = {
    showList: false,
    sortBy: null,
    sortedOpts: null
  };

  selectOpt = (val) => {
    this.props.onChange(this.props.formId, this.props.name, val);
    this.setState({
      showList: false,
      sortBy: null,
      sortedOpts: this.props.options
    });
  };

  onKeyDown = (e) => {
    const key = e.which || e.keyCode
    const currValue = document.activeElement.id && document.activeElement.id.includes('input-placeholder')
      ? document.activeElement.id.replace('input-placeholder-', '')
      : null
    const options = this.state.sortedOpts

    // close if esc key
    if (key === 27) {
      this.setState({
        showList: false,
        sortBy: null,
        sortedOpts: this.props.options
      })
    } else if (key === 40 || (key === 38)) { // arrow keys
      e.preventDefault();
      let nextValue = currValue
        ? (
          options.find((opt, i) => opt.value
            ? options[i-1] && (options[i-1].value === currValue)
            : options[i-1] && (options[i-1] === currValue)
          )
        ) : (
          options[0].value ? options[0].value : options[0]
        )
      let prevValue = currValue
        ? (
          options.find((opt, i) => opt.value
            ? options[i+1] && (options[i+1].value === currValue)
            : options[i+1] && (options[i+1] === currValue)
          )
        ) : (
          options[0].value ? options[0].value : options[0]
        )

      nextValue = nextValue && nextValue.value ? nextValue.value : nextValue
      prevValue = prevValue && prevValue.value ? prevValue.value : prevValue

      if (key === 40) { // arrow down, open and go to next opt
        this.setState({
          showList: true
        }, () => {
          const elem = document.getElementById(`input-placeholder-${nextValue}`)
          if (elem) {
            elem.focus()
          }
        })
      } else if (key === 38) { // arrow up, go to prev opt
        this.setState({
          showList: true
        }, () => {
          const elem = document.getElementById(`input-placeholder-${prevValue}`)
          if (elem) {
            elem.focus()
          }
        })
      }
    }
  }

  closeOpts = (e) => {
    e.persist()
    const target = e.target

    // find if it's our label or inside our label
    let thisLabel = e.relatedTarget;
    if (thisLabel && thisLabel.getAttribute) {
      while (thisLabel && thisLabel.getAttribute && !thisLabel.getAttribute('for')) {
        if (thisLabel.parentNode) {
          thisLabel = thisLabel.parentNode
        } else {
          // not even an input
          thisLabel = null;
        }
      }
    } else {
      thisLabel = null;
    }

    // if (!thisLabel || (thisLabel.getAttribute && thisLabel.getAttribute('for') && (thisLabel.getAttribute('for') !== this.props.name))) {
    //   this.setState({
    //     showList: false
    //   })
    // }

    const select = document.getElementById(this.props.name)

    if (this.props.onBlur) {
      this.props.onBlur(e, select)
    }
  }

  sortResults = (e) => {
    this.setState({
      showList: true,
      sortBy: e.target.value,
      sortedOpts: this.props.options.filter((opt) => compareLetters(e.target.value, (opt.label ? opt.label : opt)))
    })
  }

  toggleList = (e) => {
    e.preventDefault();
    this.setState({
      focusedOpt: null,
      showList: !this.state.showList
    });
  };

  componentWillReceiveProps = (newProps) => {
    if (newProps.options.length != this.props.options.length) {
      this.setState({
        sortBy: null,
        sortedOpts: this.props.options
      })
    }
  }

  componentDidMount() {
    this.setState({
      sortedOpts: this.props.options
    })
  }

  render() {
    const { containerClass, label, name, onChange, loading, options, typeAhead, showLabel, validateAs, value, error, ...rest } = this.props;
    const sortedOpts = this.state.sortedOpts || this.props.options
    let opts = sortedOpts.map((opt, i) => {
      return opt.label
        ? (
          <option key={ `${name}-opt-${i}` } value={ opt.value }>
            { opt.label }
          </option>
        ) : (
          <option key={ `${name}-opt-${i}` } value={ opt }>{ opt }</option>
        );
    });

    let placeholderOpts = sortedOpts.map((opt, i) => {
      return opt.label
        ? (
          <li key={ `${ name }-opt-${i}` } onClick={ (e) => this.selectOpt(opt.value) }>
            <button id={ `input-placeholder-${opt.value}` }>
              { opt.label }
            </button>
          </li>
        ) : (
          <li key={ `${ name }-opt-${i}` } onClick={ (e) => this.selectOpt(opt) }>
            <button id={ `input-placeholder-${opt}` }>
              { opt }
            </button>
          </li>
        );
    })

    let attr = {};

    if (rest.required) {
      attr['required'] = true;
      attr['aria-required'] = true;
    }

    let translateVal = options[0] && !!options[0].label;
    let activeOptLabel;
    if (translateVal && value) {
      activeOptLabel = options.filter((opt) => opt.value.toString() === value.toString())[0];
      activeOptLabel = activeOptLabel ? activeOptLabel.label : 'Select';
    }

    const typeAheadDisplay = this.state.sortBy || (this.state.sortBy === '')
      ? this.state.sortBy
      : (this.props.placeholder && !value
        ? this.props.placeholder
        : (translateVal
          ? activeOptLabel
          : (value || 'Select')
        )
      )

    return (
      <label className={ `Input-label SelectInput ${ containerClass || '' }` } htmlFor={ name } onBlur={ this.closeOpts }
        onKeyDown={ this.onKeyDown } id={ `${ name }-label` }>
        <span className={ `Input-label-text ${ !showLabel ? 'u-sr-only' : '' }` }>
          { label }{ attr.required && <span>{ '\u00A0' }*<span className='u-sr-only'> required field</span></span> }
            {loading ? <Loading/> : null}
        </span>
        { options.length && typeAhead
          ? (
            <input type='text' className={ `Btn Input-placeholder non-sr-only ${ this.state.showList ? 'is-open' : '' }` }
              value={ typeAheadDisplay } aria-hidden role='presentation'
              onChange={ this.sortResults }
            />
          ) : (
            <button disabled={!options.length} className={ `${!options.length ? 'Btn is-disabled' : 'Btn'} Input-placeholder non-sr-only ${ this.state.showList ? 'is-open' : '' }` }
              onClick={ this.toggleList } aria-hidden role='presentation'>
              { this.props.placeholder && !value
                ? <span className='u-grayed-out'>{ this.props.placeholder }</span>
                :  (translateVal ? activeOptLabel : (value || 'Select'))
              }
            </button>
          )
        }
        { error && <ErrorTip contents={ error } className='Tooltip--error--select' /> }
        { this.state.showList &&
          <ul className='SelectInput-opts non-sr-only' aria-hidden role='presentation'>
            { placeholderOpts }
          </ul>
        }
        <select value={ value } name={ name } id={ name } className='u-sr-only' { ...attr } data-validate={ validateAs }
          onChange={ (e) => this.selectOpt(e.target.value) }>
          { opts }
        </select>
      </label>
    )
  }
}

SelectInput.propTypes = {
  containerClass: PropTypes.string,
  formId: PropTypes.string.isRequired,
  error: PropTypes.string,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  loading: PropTypes.string,
  onBlur: PropTypes.func,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.oneOfType(PropTypes.string, PropTypes.number)
      }),
      PropTypes.string
    ]).isRequired
  ).isRequired,
  required: PropTypes.bool,
  showLabel: PropTypes.bool,
  typeAhead: PropTypes.bool,
  validateAs: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired
}

SelectInput.defaultProps = {
  options: [],
  typeAhead: true,
  value: ''
}

export default SelectInput;
